import { ChatCohere } from "@langchain/cohere";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createStructuredChatAgent } from "langchain/agents";
import { pull } from "langchain/hub";

import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

import { getOnChainTools } from "@nova-sdk/adapter-langchain";
import { cosmosbank } from "@nova-sdk/plugin-cosmosbank";
import { CosmosWalletOptions, cosmos } from "@nova-sdk/wallet-cosmos";

require("dotenv").config();

(async (): Promise<void> => {
    const mnemonic = process.env.WALLET_MNEMONICS as `0x${string}`;
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
        mnemonic,
        { prefix: "pryzm" }, // e.g atom, pryzm, pokt, dora e.t.c
    );

    const [Account] = await wallet.getAccounts();
    const rpcEndpoint = process.env.RPC_PROVIDER_URL as `0x${string}`;
    const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, wallet);

    const walletClient: CosmosWalletOptions = {
        client: client,
        account: Account,
    };

    const llm = new ChatCohere({
        model: "command-r-plus",
    });

    const prompt = await pull<ChatPromptTemplate>("hwchase17/structured-chat-agent");

    const tools = await getOnChainTools({
        wallet: cosmos(walletClient),
        plugins: [await cosmosbank()],
    });

    const agent = await createStructuredChatAgent({
        llm,
        tools,
        prompt,
    });

    const agentExecutor = new AgentExecutor({
        agent,
        tools,
    });

    const response = await agentExecutor.invoke({
        //input: "get the {{PRYZM}} token total supply",
        //input: "get the {{PRYZM}} token balance of this address {{_addr}}",
        //input: "send 1 {{PRYZM}} token to {{_addr}}",
    });

    console.log(response);
})();
