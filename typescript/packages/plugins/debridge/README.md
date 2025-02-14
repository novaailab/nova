# nova DeBridge Plugin 🐐 - TypeScript

DeBridge plugin for nova. Allows you to create tools for bridging tokens across different chains using the DeBridge Liquidity Network (DLN).

## Installation
```
npm install @nova-sdk/plugin-debridge
```

## Setup

```typescript
import { debridge } from "@nova-sdk/plugin-debridge";

// Using default DeBridge API URL
const plugin = debridge();

// Or with custom API URL
const plugin = debridge({
    baseUrl: process.env.DEBRIDGE_BASE_URL
});
```

## Available Actions

### Create Bridge Order
Creates a cross-chain token transfer order.

### Get Bridge Quote
Gets a quote for a cross-chain token transfer.

### Execute Bridge Transaction
Signs and broadcasts the bridge transaction.

## nova

<div align="center">
Go out and eat some grass.

[Docs](https://ohmynova.dev) | [API](https://dln.debridge.finance/v1.0) | [Discord](https://discord.com/invite/debridge) </div>

## nova 🐐
nova 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
