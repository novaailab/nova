import dotenv from "dotenv";

dotenv.config();

import { createWalletClient } from "viem";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";

import { createOrDeriveAPIKey } from "@nova-sdk/plugin-polymarket";
import { viem } from "@nova-sdk/wallet-viem";

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.ALCHEMY_API_KEY),
    chain: polygon,
});

const wallet = viem(walletClient);

(async () => {
    const credentials = await createOrDeriveAPIKey(wallet);

    console.log(credentials);
})();
