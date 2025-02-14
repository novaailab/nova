# nova Polymarket Plugin 🐐 - TypeScript

Polymarket plugin for [nova 🐐](https://ohmynova.dev). Allows you to create tools for interacting with Polymarket.

## Installation
```
npm install @nova-sdk/plugin-polymarket
```

## Usage

```typescript
import { polymarket } from "@nova-sdk/plugin-polymarket";


const plugin = polymarket({
    credentials: {
        key: process.env.POLYMARKET_API_KEY as string,
        secret: process.env.POLYMARKET_SECRET as string,
        passphrase: process.env.POLYMARKET_PASSPHRASE as string,
    },
});
```

## Working example

See the [Vercel AI example](https://github.com/nova-sdk/nova/tree/main/typescript/examples/vercel-ai/polymarket) for a working example of how to use the Polymarket plugin.

## nova

<div align="center">
Go out and eat some grass.

[Docs](https://ohmynova.dev) | [Examples](https://github.com/nova-sdk/nova/tree/main/typescript/examples) | [Discord](https://discord.gg/nova-sdk)</div>

## nova 🐐
nova 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
