import readline from "node:readline";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

import { getOnChainTools } from "@nova-sdk/adapter-vercel-ai";
import { PEPE, USDC, erc20 } from "@nova-sdk/plugin-erc20";

import { uniswap } from "@nova-sdk/plugin-uniswap";
import { sendETH } from "@nova-sdk/wallet-evm";
import { viem } from "@nova-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: base,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            sendETH(), // Enable ETH transfers
            erc20({ tokens: [USDC, PEPE] }), // Enable ERC20 token operations
            uniswap({
                baseUrl: process.env.UNISWAP_BASE_URL as string,
                apiKey: process.env.UNISWAP_API_KEY as string,
            }), // Enable Uniswap trading
        ],
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

        console.log("\n-------------------\n");
        console.log("TOOLS CALLED");
        console.log("\n-------------------\n");

        console.log("\n-------------------\n");
        console.log("RESPONSE");
        console.log("\n-------------------\n");
        try {
            const result = await generateText({
                model: openai("gpt-4o-mini"),
                tools: tools,
                maxSteps: 10, // Maximum number of tool invocations per request
                prompt: prompt,
                onStepFinish: (event) => {
                    console.log(event.toolResults);
                },
            });
            console.log(result.text);
        } catch (error) {
            console.error(error);
        }
        console.log("\n-------------------\n");
    }
})();
