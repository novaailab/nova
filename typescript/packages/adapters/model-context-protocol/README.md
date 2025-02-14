# nova Adapter Model Context Protocol (Claude) 🐐 - TypeScript

## Installation
```
npm install @nova-sdk/adapter-model-context-protocol
```

## Usage

Check out the [viem example](https://github.com/nova-sdk/nova/tree/main/typescript/examples/model-context-protocol/viem) for a full MCP server example.

```ts
const { listOfTools, toolHandler } = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [sendETH(), erc20({ tokens: [USDC, MODE] }), kim()],
});
```

## nova

<div align="center">
Go out and eat some grass.

[Docs](https://ohmynova.dev) | [Examples](https://github.com/nova-sdk/nova/tree/main/typescript/examples) | [Discord](https://discord.gg/nova-sdk)</div>

## nova 🐐
nova 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
