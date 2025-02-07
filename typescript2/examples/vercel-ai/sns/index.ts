import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { getOnChainTools } from "@nova-sdk/adapter-vercel-ai";
import { sendSOL, solana } from "@nova-sdk/wallet-solana";

import { Connection, Keypair } from "@solana/web3.js";

import { sns } from "@nova-sdk/plugin-sns";
import base58 from "bs58";

require("dotenv").config();

const connection = new Connection(process.env.RPC_PROVIDER_URL as string);
const keypair = Keypair.fromSecretKey(base58.decode(process.env.WALLET_PRIVATE_KEY as string));

(async () => {
    const tools = await getOnChainTools({
        wallet: solana({
            keypair,
            connection,
        }),
        plugins: [
            sendSOL(), // Enable SOL transfers
            sns(), // Enable SNS domain resolution
        ],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5, // Maximum number of tool invocations per request
        prompt: "Send 0.005 SOL to investigations.sol",
    });

    console.log(result.text);
})();
