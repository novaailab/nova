# 1inch nova Plugin

Get balances for different tokens for a wallet using the 1inch API.

## Installation
```bash
npm install @nova-sdk/plugin-1inch
```

## Usage
```typescript
import { oneInch } from '@nova-sdk/plugin-1inch';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       oneInch({
            apiKey: process.env.ONEINCH_API_KEY
       })
    ]
});
```

## Tools
* Get balances
