# nova SPL Token Plugin 🐐 - TypeScript

SPL Token plugin for nova. Allows you to create tools for transferring and getting the balance of SPL tokens.

## Installation
```
npm install @nova-sdk/plugin-spl-token
```

## Usage

```typescript
import { splToken, USDC, nova } from "@nova-sdk/plugin-spl-token";

const plugin = splToken({
    connection,
    network: "mainnet",
    tokens: [USDC, nova],
});
```

### Adding custom tokens
```typescript
import { splToken } from "@nova-sdk/plugin-spl-token";


const plugin = splToken({
    tokens: [
        USDC,
        {
            decimals: 9,
            symbol: "POPCAT",
            name: "Popcat",
            mintAddresses: {
                "mainnet": "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
            },
        },
    ],
});
```

## nova

<div align="center">
Go out and eat some grass.

[Docs](https://ohmynova.dev) | [Examples](https://github.com/nova-sdk/nova/tree/main/typescript/examples) | [Discord](https://discord.gg/nova-sdk)</div>

## nova 🐐
nova 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
