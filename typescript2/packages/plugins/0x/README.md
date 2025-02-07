# 0x nova Plugin

Get quotes and swap on 0x

## Installation
```bash
npm install @nova-sdk/plugin-0x
```

## Usage
```typescript
import { zeroEx } from '@nova-sdk/plugin-0x';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       zeroEx({
            apiKey: process.env.ZEROEX_API_KEY
       })
    ]
});
```

## Tools
* Get quote
* Swap
