import readline from "node:readline";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { getOnChainTools } from "@nova-sdk/adapter-vercel-ai";
import { crossmint } from "@nova-sdk/crossmint";

import { viem } from "@nova-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: sepolia,
});

const apiKey = process.env.CROSSMINT_STAGING_API_KEY; // Use staging key for development, production key for mainnet

if (!apiKey) {
    throw new Error("Missing Crossmint API key");
}

// Initialize Crossmint plugins for wallet creation and NFT minting
const { wallets, mint } = crossmint(apiKey); // wallets() for Twitter user wallets, mint() for NFT operations

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [wallets(), mint()],
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    while (true) {
        const prompt = await new Promise<string>((resolve) => {
            rl.question('Enter your prompt (or "exit" to quit): ', resolve);
        });

        if (prompt === "exit") {
            rl.close();
            break;
        }

        try {
            const result = await generateText({
                model: openai("gpt-4o-mini"),
                tools: tools,
                maxSteps: 10, // Maximum number of tool invocations per request
                prompt: prompt,
                onStepFinish: (event) => {
                    console.log("\n-------------------\n");
                    console.log("TOOLS CALLED");
                    console.log("\n-------------------\n");
                    console.log(event.toolResults);
                },
            });
            console.log("\n-------------------\n");
            console.log("RESPONSE");
            console.log("\n-------------------\n");
            console.log(result.text);
        } catch (error) {
            console.error(error);
        }
        console.log("\n-------------------\n");
    }
})();
