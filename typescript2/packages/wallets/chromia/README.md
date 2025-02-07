# nova Wallet Chromia 🐐 - TypeScript

## Installation
```
npm install @nova-sdk/wallet-chromia
```
## Steps to Create a Chromia Dapp Account

1. **Go to Chromia Vault**
   Visit the [Chromia Vault](https://vault.chromia.com/en/dapps/).

2. **Connect Your Wallet**
   Click on the **Connect** button located in the top right corner of the page.

3. **Create a Dapp Account**
   Once connected, click on your address in the top right corner and select **Create Dapp Account**.

4. **Choose the Chromia Economy Chain**
   - Select the **Chromia Economy Chain** option.
   - Follow the prompts to deposit the required amount of CHR to create your account.

5. **Confirm Your Address**
   After making the deposit, your CHR address will be listed below for your reference.


## Usage

### With EVM Wallet

Chromia is interoperable with EVM, it is not EVM-compatible.

> When you add a network (like Binance Chain or Polygon) to Metamask, it behaves exactly the same way as Ethereum. That’s because all of these chains are based on the Ethereum Virtual Machine.
>
> Chromia users will not add Chromia as a network and view their tokens in Metamask the same way they would with an Ethereum fork.
>
> Instead, by cryptographically linking your Chromia address to your EVM address, Metamask can be used to sign transactions that originate on Chromia. This will feel familiar, with some key differences. For example, there is no need to set or pay gas fees in Metamask. Instead, the user flow is more like:

[Read More](https://blog.chromia.com/chromia-explained-eif/)

Setup `.env`
```sh
EVM_PRIVATE_KEY=0xabc
```

```typescript
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getOnChainTools } from "@nova-sdk/adapter-vercel-ai";
import { createClient } from "postchain-client";
import { CHROMIA_MAINNET_BRID, chromia } from "@nova-sdk/wallet-chromia";
import { createConnection, createInMemoryEvmKeyStore, createKeyStoreInteractor } from "@chromia/ft4";
import { sendCHR } from "@nova-sdk/wallet-chromia";

const privateKey = process.env.EVM_PRIVATE_KEY

const chromiaClient = await createClient({
    nodeUrlPool: ["https://system.chromaway.com:7740"],
    blockchainRid: CHROMIA_MAINNET_BRID.ECONOMY_CHAIN
});
const connection = createConnection(chromiaClient);
const evmKeyStore = createInMemoryEvmKeyStore({
    privKey: privateKey,
} as any);
const keystoreInteractor = createKeyStoreInteractor(chromiaClient, evmKeyStore)
const accounts =  await keystoreInteractor.getAccounts();
const accountAddress = accounts[0].id.toString("hex");
console.log("ACCOUNT ADDRESS: ", accountAddress);

const tools = await getOnChainTools({
    wallet: chromia({
        client: chromiaClient,
        accountAddress,
        keystoreInteractor,
        connection
    }),
    plugins: [
        sendCHR()
    ],
});
```
