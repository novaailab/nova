# nova Uniswap Plugin 🐐 - TypeScript

Uniswap plugin for [nova 🐐](https://ohmynova.dev). Allows you to create tools for interacting with Uniswap.

## Installation
```
npm install @nova-sdk/plugin-uniswap
```

You can get your Uniswap API key [here](https://hub.uniswap.org/).

For testing purposes, you can use the following base URL and API key:

```
https://trade-api.gateway.uniswap.org/v1
kHEhfIPvCE3PO5PeT0rNb1CA3JJcnQ8r7kJDXN5X
```

## Usage

```typescript
import { uniswap } from "@nova-sdk/plugin-uniswap";


const plugin = uniswap({
    baseUrl: process.env.UNISWAP_BASE_URL as string,
    apiKey: process.env.UNISWAP_API_KEY as string,
});
```

## Working example

See the [Vercel AI example](https://github.com/nova-sdk/nova/tree/main/typescript/examples/vercel-ai/uniswap) for a working example of how to use the Uniswap plugin.

## nova

<div align="center">
Go out and eat some grass.

[Docs](https://ohmynova.dev) | [Examples](https://github.com/nova-sdk/nova/tree/main/typescript/examples) | [Discord](https://discord.gg/2F8zTVnnFz)</div>

## nova 🐐
nova 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
