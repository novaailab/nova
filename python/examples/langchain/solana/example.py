import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from solana.rpc.api import Client as SolanaClient
from solders.keypair import Keypair

from nova_adapters.langchain import get_on_chain_tools
from nova_wallets.solana import solana
from nova_plugins.jupiter import jupiter, JupiterPluginOptions
from nova_plugins.spl_token import spl_token, SplTokenPluginOptions
from nova_plugins.spl_token.tokens import SPL_TOKENS

# Initialize Solana client
client = SolanaClient(os.getenv("SOLANA_RPC_ENDPOINT"))

# Initialize regular Solana wallet
keypair = Keypair.from_base58_string(os.getenv("SOLANA_WALLET_SEED") or "")
wallet = solana(client, keypair)

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o-mini")

def main():

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
        wallet=wallet,
        plugins=[
            jupiter(JupiterPluginOptions()),  # No options needed for Jupiter v6
            spl_token(SplTokenPluginOptions(
                network="mainnet",  # Using devnet as specified in .env
                tokens=SPL_TOKENS
            )),
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
