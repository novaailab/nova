# nova ERC721 Plugin 🐐 - TypeScript

ERC721 plugin for nova. Allows you to create tools for transferring and getting the balance of ERC721 tokens.

## Installation
```
npm install @nova-sdk/plugin-erc721
```

## Usage

```typescript
import { erc721, BAYC } from "@nova-sdk/plugin-erc721";

const plugin = erc721({
    tokens: [BAYC],
});
```

### Adding custom tokens
```typescript
import { erc721, BAYC } from "@nova-sdk/plugin-erc721";

const plugin = erc721({
  tokens: [
    BAYC,
    {
      symbol: "PUNK",
      name: "CryptoPunks",
      chains: {
        "1": {
          contractAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
        },
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
