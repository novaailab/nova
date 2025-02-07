# nova Coingecko Plugin 🐐 - TypeScript

Coingecko plugin for nova. Allows you to create tools for interacting with the CoinGecko API.

## Installation
```
npm install @nova-sdk/plugin-coingecko
```

## Setup

```typescript
import { coingecko } from "@nova-sdk/plugin-coingecko";

const plugin = coingecko({
    apiKey: process.env.COINGECKO_API_KEY
});
```

## Available Actions

### Get Trending Coins
Fetches the current trending cryptocurrencies.

### Get Coin Price
Fetches the current price and optional market data for a specific cryptocurrency.

## nova

<div align="center">
Go out and eat some grass.

[Docs](https://ohmynova.dev) | [Examples](https://github.com/nova-sdk/nova/tree/main/typescript/examples) | [Discord](https://discord.gg/nova-sdk)</div>

## nova 🐐
nova 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
