# nova Wallet Fuel 🐐 - TypeScript

## Installation

```
npm install @nova-sdk/wallet-fuel
```

## Usage

```typescript
import { Provider, Wallet } from "fuels";
import { fuel } from "@nova-sdk/wallet-fuel";
import { getOnChainTools } from "@nova-sdk/core";

const provider = await Provider.create(
    "https://mainnet.fuel.network/v1/graphql"
);

const tools = await getOnChainTools({
    wallet: fuel({
        privateKey: process.env.FUEL_WALLET_PRIVATE_KEY,
        provider,
    }),
});
```
