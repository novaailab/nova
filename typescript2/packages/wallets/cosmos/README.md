# nova Wallet Cosmos 🐐 - TypeScript

## Installation
```
npm install @nova-sdk/wallet-cosmos
```

## Usage

```typescript
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient} from "@cosmjs/stargate";

import { getOnChainTools } from "@nova-sdk/adapter-langchain";
import { cosmosbank } from "@nova-sdk/plugin-cosmosbank";
import { cosmos, CosmosWalletOptions } from "@nova-sdk/wallet-cosmos";

const mnemonic = (process.env.WALLET_MNEMONICS as `0x${string}`);
const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    mnemonic,
    { prefix: "" } // e.g atom, pryzm, pokt, dora e.t.c
    );

const [Account] = await wallet.getAccounts();
const rpcEndpoint = (process.env.RPC_PROVIDER_URL as `0x${string}`);
const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet)

const walletClient : CosmosWalletOptions = {
    client : client,
    account : Account
}

const tools = await getOnChainTools({
    wallet: cosmos(walletClient),
    plugins: [await cosmosbank()],
});

```



