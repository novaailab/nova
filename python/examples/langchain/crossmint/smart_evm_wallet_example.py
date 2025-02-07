import os
import requests
from eth_account import Account
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate

from nova_adapters.langchain import get_on_chain_tools
from nova_plugins.erc20 import erc20, ERC20PluginOptions
from nova_plugins.erc20.token import USDC, PEPE
from nova_wallets.evm.send_eth import send_eth
from nova_wallets.crossmint import crossmint

def create_smart_wallet(signer_public_key: str, api_key: str, base_url: str = "https://staging.crossmint.com") -> dict:
    """Create a new smart wallet using the Crossmint API."""
    response = requests.post(
        f"{base_url}/api/v1-alpha2/wallets",
        headers={
            "X-API-KEY": api_key,
            "Content-Type": "application/json",
        },
        json={
            "type": "evm-smart-wallet",
            "config": {
                "adminSigner": {
                    "type": "evm-keypair",
                    "address": signer_public_key,
                },
            },
        },
    )
    return response.json()

def main():
    # Get required environment variables
    api_key = os.getenv("CROSSMINT_API_KEY")
    if not api_key:
        raise ValueError("CROSSMINT_API_KEY environment variable is required")

    # Create Crossmint client
    crossmint_client = crossmint(api_key)

    # Create a new smart wallet if address is not provided
    secret_key = os.getenv("SIGNER_WALLET_SECRET_KEY")
    if not secret_key:
        raise ValueError("SIGNER_WALLET_SECRET_KEY environment variable is required")

    signer_address = Account.from_key(secret_key).address

    # Create the smart wallet
    wallet_response = create_smart_wallet(
        signer_public_key=signer_address,
        api_key=api_key,
        base_url=os.getenv("CROSSMINT_BASE_URL", "https://staging.crossmint.com")
    )

    if "error" in wallet_response:
        raise Exception(f"Failed to create wallet: {wallet_response}")

    print(f"Created smart wallet: {wallet_response['address']}")

    # Initialize the smart wallet client
    crossmint_wallet = crossmint_client["smartwallet"]({
        "address": wallet_response["address"],
        "signer": {
            "secretKey": secret_key,
        },
        "provider": os.getenv("EVM_PROVIDER_URL", "https://base-mainnet.g.alchemy.com/v2/demo"),
        "ensProvider": os.getenv("ENS_PROVIDER_URL", "https://base-mainnet.g.alchemy.com/v2/demo"),
        "chain": "base",
    })

    # Initialize LLM
    llm = ChatOpenAI(model="gpt-4o-mini")

    # Get the prompt template
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are a helpful assistant"),
            ("placeholder", "{chat_history}"),
            ("human", "{input}"),
            ("placeholder", "{agent_scratchpad}"),
        ]
    )

    # Initialize tools with Solana wallet
    tools = get_on_chain_tools(
        wallet=crossmint_wallet,
        plugins=[
            send_eth(),
            erc20(options=ERC20PluginOptions(tokens=[USDC, PEPE])),
        ],
    )

    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(
        agent=agent, tools=tools, handle_parsing_errors=True, verbose=True
    )

    while True:
        user_input = input("\nYou: ").strip()

        if user_input.lower() == "quit":
            print("Goodbye!")
            break

        try:
            response = agent_executor.invoke(
                {
                    "input": user_input,
                }
            )

            print("\nAssistant:", response["output"])
        except Exception as e:
            print("\nError:", str(e))


if __name__ == "__main__":
    main()
