
<div align="center">

[Website](https://ohmynova.dev) | [X](https://x.com/nova_sdk) | [Discord](https://discord.gg/nova-sdk)

nova is free software, MIT licensed, sponsored by [Crossmint](https://www.crossmint.com)

![NPM Downloads](https://img.shields.io/npm/dm/%40nova-sdk%2Fcore)
![GitHub License](https://img.shields.io/github/license/nova-sdk/nova)

![Static Badge](https://img.shields.io/badge/v20.12.2-1?label=typescript&color=blue)


</div>

# nova 🐐  (Typescript)
![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/nova-sdk)

nova (Great Onchain Agent Toolkit) is a library that adds more than +200 onchain tools to your AI agent.

* **[+200 tools](#plugins)**: DeFi (Uniswap, Jupiter, KIM, Orca, etc.), minting (OpenSea, MagicEden, etc.), betting (Polymarket, etc.), analytics (CoinGecko, BirdEye, Allora, etc.) and more
* **Chains**: EVM (Base, Polygon, Mode, Sei, etc.), Solana, Aptos, Chromia, Fuel, Sui, Starknet and Zilliqa
* **[Wallets](#wallets)**: keypair, smart wallets (Crossmint, etc.), LIT, MPC (Coinbase, etc.)
* **[Agent Frameworks](#agent-frameworks-adapters)**: AI SDK, Langchain, Eliza, ZerePy, GAME, ElevenLabs, etc.


## Table of Contens
- [nova 🐐  (Typescript)](#nova---typescript)
  - [Table of Contens](#table-of-contens)
  - [Installation](#installation)
  - [Usage](#usage)
  - [How to create a plugin](#how-to-create-a-plugin)
    - [Using the Plugin Generator](#using-the-plugin-generator)
    - [Manual Creation](#manual-creation)
      - [1. Define your plugin extending the PluginBase class.](#1-define-your-plugin-extending-the-pluginbase-class)
      - [2. Add tools to the plugin](#2-add-tools-to-the-plugin)
        - [Option 1: Using the `@Tool` decorator](#option-1-using-the-tool-decorator)
        - [Option 2: Using the `getTools` and `createTool` functions](#option-2-using-the-gettools-and-createtool-functions)
      - [3. Add the plugin to the agent](#3-add-the-plugin-to-the-agent)
      - [Next steps](#next-steps)
  - [How to add a chain](#how-to-add-a-chain)
    - [1. Add the chain to the `Chain.ts` file](#1-add-the-chain-to-the-chaints-file)
    - [2. Create a new wallet provider package](#2-create-a-new-wallet-provider-package)
    - [3. Create a plugin to allow sending your native token to a wallet](#3-create-a-plugin-to-allow-sending-your-native-token-to-a-wallet)
    - [4. Implement the wallet client](#4-implement-the-wallet-client)
    - [5. Submit a PR](#5-submit-a-pr)
  - [How to add a wallet provider](#how-to-add-a-wallet-provider)
  - [Packages](#packages)
    - [Core](#core)
    - [Wallets](#wallets)
    - [Agent Framework Adapters](#agent-framework-adapters)
    - [Plugins](#plugins)

## Installation
1. Install the core package
```bash
npm install @nova-sdk/core
```
2. Depending on the type of wallet you want to use, install the corresponding wallet (see all wallets [here](#wallets)):
```bash
npm install @nova-sdk/wallet-solana
```
3. Install the plugins for the protocols you need (see all available plugins [here](#plugins))

```bash
npm install @nova-sdk/plugin-jupiter @nova-sdk/plugin-spl-token
```
4. Install the adapter for the agent framework you want to use (see all available adapters [here](#adapters))
```bash
npm install @nova-sdk/adapter-ai-sdk
```

## Usage
1. Configure your wallet
```typescript
import { Connection, Keypair } from "@solana/web3.js";

const connection = new Connection(process.env.SOLANA_RPC_URL as string);
const keypair = Keypair.fromSecretKey(base58.decode(process.env.SOLANA_PRIVATE_KEY as string));


```

2. Configure your tools for the framework you want to use
```typescript
import { getOnChainTools } from "@nova-sdk/adapter-ai-sdk";
import { solana, sendSOL } from "@nova-sdk/wallet-solana";
import { jupiter } from "@nova-sdk/plugin-jupiter";
import { splToken } from "@nova-sdk/plugin-spl-token";

const tools = await getOnChainTools({
    wallet: solana({
        keypair,
        connection,
    }),
    plugins: [
        sendSOL(),
        jupiter(),
        splToken(),
    ],
  });
```

3. Plug into your agent framework
```typescript
const result = await generateText({
    model: openai("gpt-4o-mini"),
    tools: tools,
    maxSteps: 10,
    prompt: "Swap 10 USDC for JLP",
});

console.log(result);
```

## How to create a plugin
nova plugins enable your agent to interact with various blockchain protocols.

Plugins can be chain-specific (EVM, Solana, etc.) or chain-agnostic. If a plugin is chain-specific it will fail to compile when being used with a wallet of a different chain.

You can see all available plugins [here](#plugins).

### Using the Plugin Generator
Use the `create-plugin` command to generate all the necessary files and configuration for a new plugin

```bash
# Create a plugin with default type (any)
pnpm create-plugin -n your-plugin-name

# Create a plugin for a specific chain type
pnpm create-plugin -n your-plugin-name -t evm  # For EVM chains
pnpm create-plugin -n your-plugin-name -t solana  # For Solana
```
The command will generate:
- A `package.json` with standard metadata and dependencies
- TypeScript configuration files (`tsconfig.json`, `tsup.config.ts`)
- A basic plugin structure in the `src` directory:
  - `parameters.ts` - Example parameters using Zod schema
  - `your-plugin-name.service.ts` - Service class with an example tool
  - `your-plugin-name.plugin.ts` - Plugin class extending PluginBase
  - `index.ts` - Exports for your plugin


### Manual Creation
#### 1. Define your plugin extending the [PluginBase](https://github.com/nova-sdk/nova/tree/main/typescript/packages/core/src/classes/PluginBase.ts) class.

```typescript
import { PluginBase, WalletClientBase } from "@nova-sdk/core";

// For a chain-agnostic plugin we use the WalletClientBase interface, for a chain-specific plugin we use the EVMWalletClient, SolanaWalletClient, or corresponding interfaces
export class MyPlugin extends PluginBase<WalletClientBase> {
    constructor() {
        // We define the name of the plugin
        super("myPlugin", []);
    }

    // We define the chain support for the plugin, in this case we support all chains
    supportsChain = (chain: Chain) => true;
}

// We export a factory function to create a new instance of the plugin
export const myPlugin = () => new MyPlugin();
```

#### 2. Add tools to the plugin

There are two ways to add tools to the plugin:
1. Using the `@Tool` decorator on our own class
2. Using the `getTools` and `createTool` functions to create tools dynamically

##### Option 1: Using the `@Tool` decorator
The `@Tool` decorator is a way to create tools in a more declarative way.

You can create a class and decorate its methods with the `@Tool` decorator to create tools.

The tool methods will receive the wallet client as the first argument and the parameters as the second argument.

```typescript
import { Tool } from "@nova-sdk/core";
import { createToolParameters } from "@nova-sdk/core";
import { z } from "zod";

export class SignMessageParameters extends createToolParameters(
    z.object({
        message: z.string(),
    }),
) {}

class MyTools {
    @Tool({
        name: "sign_message",
        description: "Sign a message",
    })
    async signMessage(walletClient: WalletClientBase, parameters: SignMessageParameters) {
        const signed = await walletClient.signMessage(parameters.message);
        return signed.signedMessage;
    }
}
```

Once we have our class we now need to import it in our plugin class.

```typescript
export class MyPlugin extends PluginBase<WalletClientBase> {
    constructor() {
        // We define the name of the plugin
        super("myPlugin", [new MyTools()]);
    }

    // We define the chain support for the plugin, in this case we support all chains
    supportsChain = (chain: Chain) => true;
}

// We export a factory function to create a new instance of the plugin
export const myPlugin = () => new MyPlugin();
```

##### Option 2: Using the `getTools` and `createTool` functions
We will implement the `getTools` method in our plugin class.

Inside the method, we will return an array of tools created using the `createTool` function.

```typescript
import { PluginBase, WalletClientBase, createTool } from "@nova-sdk/core";

// Since we are creating a chain-agnostic plugin, we can use the WalletClientBase interface
export class MyPlugin extends PluginBase<WalletClientBase> {
    constructor() {
        // We define the name of the plugin
        super("myPlugin", []);
    }

    // We define the chain support for the plugin, in this case we support all chains
    supportsChain = (chain: Chain) => true;

    getTools(walletClient: WalletClientBase) {
        return [
            // Create tool requires two arguments:
            // 1. The tool metadata (name, description, parameters)
            // 2. The tool method (the function that will be executed when the tool is used)
            createTool(
                {
                    name: "sign_message",
                    description: "Sign a message",
                    parameters: z.object({
                        message: z.string(),
                    }),
                },
                async (parameters) => {
                    const signed = await walletClient.signMessage(parameters.message);
                    return signed.signedMessage;
                },
            ),
        ];
    }
}

// We export a factory function to create a new instance of the plugin
export const myPlugin = () => new MyPlugin();
```

#### 3. Add the plugin to the agent

```typescript
import { getOnChainTools } from '@nova-sdk/adapter-vercel-ai';
import { myPlugin } from './your-plugin-path/signMessagePlugin'; // Path to your plugin

const wallet = /* Initialize your wallet client */;

const tools = getOnChainTools({
    wallet: viem(wallet), // or smartwallet(wallet), solana(wallet), etc.
    plugins: [
        myPlugin(),
        // ...other plugins
    ],
});

// Prompt: Sign the message "Sign the message 'Go out and eat grass 🐐'"
```

#### Next steps
- Share your plugin with others!
- Open a PR to add it to the [plugins registry](https://github.com/nova-sdk/nova/tree/main/typescript/packages/plugins) in the [nova SDK](https://github.com/nova-sdk/nova).



## How to add a chain

### 1. Add the chain to the `Chain.ts` file
Add your chain to the `Chain.ts` file in the [core package](https://github.com/nova-sdk/nova/tree/main/typescript/packages/core/src/types/Chain.ts).

```typescript
/**
 * @param type - "evm" or "solana", extend this union as needed (e.g., "sui")
 * @param id - Chain ID, optional for EVM
 */
export type Chain = EvmChain | SolanaChain | AptosChain | ChromiaChain | FuelChain | MyAwesomeChain;

export type MyAwesomeChain = {
    type: "my-awesome-chain";
};
```

### 2. Create a new wallet provider package
Create a new package in the [wallets directory](https://github.com/nova-sdk/nova/tree/main/typescript/packages/wallets) with the name of your chain (e.g. `my-awesome-chain`) or copy an existing one (e.g. `evm`).
In this package you will define the abstract class for your chain's wallet client which will extend the `WalletClientBase` class defined in the [core package](https://github.com/nova-sdk/nova/tree/main/typescript/packages/core/src/classes/WalletClientBase.ts).

WalletClientBase only includes the methods that are supported by all chains such as:
1. `getAddress`
2. `getChain`
3. `signMessage`
4. `balanceOf`

As well as includes the `getCoreTools` method which returns the core tools for the chain.

```typescript
export abstract class MyAwesomeChainWalletClient extends WalletClientBase {
    // Add your chain's methods here
    abstract getChain(): MyAwesomeChain;
    sendTransaction: (transaction: AwesomeChainTransaction) => Promise<Transaction>;
    read: (query: AwesomeChainQuery) => Promise<AwesomeChainResponse>;
}
```

### 3. Create a plugin to allow sending your native token to a wallet
Create a plugin to allow sending your native token to a wallet. Create a file in the same package as your wallet client and create a new file like `send<native-token>.plugin.ts`.

Implement the core plugin.


```typescript
export class SendAWESOMETOKENPlugin extends PluginBase<MyAwesomeChainWalletClient> {
    constructor() {
        super("sendAWESOMETOKEN", []);
    }

    supportsChain = (chain: Chain) => chain.type === "my-awesome-chain";

    getTools(walletClient: MyAwesomeChainWalletClient) {
        const sendTool = createTool(
            {
                name: `send_myawesometoken`,
                description: `Send MYAWESOMETOKEN to an address.`,
                parameters: sendAWESOMETOKENParametersSchema, // Define the parameters schema
            },
            // Implement the method
            (parameters: z.infer<typeof sendAWESOMETOKENParametersSchema>) => sendAWESOMETOKENMethod(walletClient, parameters),
        );
        return [sendTool];
    }
}
```

### 4. Implement the wallet client
Extend your abstract class with the methods you need to implement and create your first wallet client! (e.g `MyAwesomeChainKeyPairWalletClient`)

```typescript
export class MyAwesomeChainKeyPairWalletClient extends MyAwesomeChainWalletClient {
    // Implement the methods here
}

// Export the wallet client with a factory function
export const myAwesomeChain = () => new MyAwesomeChainKeyPairWalletClient();
```

### 5. Submit a PR
Submit a PR to add your wallet provider to the [wallets directory](https://github.com/nova-sdk/nova/tree/main/typescript/packages/wallets).

## How to add a wallet provider
If you don't see your wallet provider supported, you can easily integrate it by implementing the specific [WalletClient](https://github.com/nova-sdk/nova/blob/main/typescript/packages/core/src/wallets/core.ts) interface for the chain and type of wallet you want to support:

1. [EVMWalletClient](https://github.com/nova-sdk/nova/blob/main/typescript/packages/core/src/wallets/evm.ts) for all EVM chains
2. [EVMSmartWalletClient](https://github.com/nova-sdk/nova/blob/main/typescript/packages/core/src/wallets/evm-smart-wallet.ts) for EVM smart wallets
2. [SolanaWalletClient](https://github.com/nova-sdk/nova/blob/main/typescript/packages/core/src/wallets/solana.ts) for Solana

Checkout [here how the viem client implementation](https://github.com/nova-sdk/nova/blob/main/typescript/packages/wallets/viem/src/index.ts).

If you would like to see your wallet provider supported, please open an issue or submit a PR.

## Packages
### Core
|  | NPM package |
| --- | --- |
| Core | [@nova-sdk/core](https://www.npmjs.com/package/@nova-sdk/core) |

### Wallets
| Wallet | NPM package |
| --- | --- |
|EVM | [@nova-sdk/wallet-evm](https://www.npmjs.com/package/@nova-sdk/wallet-evm) |
|Viem | [@nova-sdk/wallet-evm-viem](https://www.npmjs.com/package/@nova-sdk/wallet-evm-viem) | [nova-sdk-wallet-evm](https://pypi.org/project/nova-sdk-wallet-evm/) |
| Solana | [@nova-sdk/wallet-solana](https://www.npmjs.com/package/@nova-sdk/wallet-solana) | [@nova-sdk-wallet-solana](https://pypi.org/project/nova-sdk-wallet-solana/) |
| Crossmint (smart and custodial wallets) | [@nova-sdk/wallet-crossmint](https://www.npmjs.com/package/@nova-sdk/wallet-crossmint) | [@nova-sdk-wallet-crossmint](https://pypi.org/project/nova-sdk-wallet-crossmint/) |
| Aptos | [@nova-sdk/wallet-aptos](https://www.npmjs.com/package/@nova-sdk/wallet-aptos) |
| Chromia | [@nova-sdk/wallet-chromia](https://www.npmjs.com/package/@nova-sdk/wallet-chromia) |
| Cosmos | [@nova-sdk/wallet-cosmos](https://www.npmjs.com/package/@nova-sdk/wallet-cosmos) |
| Fuel | [@nova-sdk/wallet-fuel](https://www.npmjs.com/package/@nova-sdk/wallet-fuel) |
| Sui | [@nova-sdk/wallet-sui](https://www.npmjs.com/package/@nova-sdk/wallet-sui) |
| Starknet | [@nova-sdk/wallet-starknet](https://www.npmjs.com/package/@nova-sdk/wallet-starknet) |
| Zilliqa | [@nova-sdk/wallet-zilliqa](https://www.npmjs.com/package/@nova-sdk/wallet-zilliqa) |

### Agent Framework Adapters
| Adapter | NPM package |
| --- | --- |
| AI SDK | [@nova-sdk/adapter-ai-sdk](https://www.npmjs.com/package/@nova-sdk/adapter-ai-sdk) |
| Langchain | [@nova-sdk/adapter-langchain](https://www.npmjs.com/package/@nova-sdk/adapter-langchain) |
| ElevenLabs | [@nova-sdk/adapter-elevenlabs](https://www.npmjs.com/package/@nova-sdk/adapter-elevenlabs) |  |
| LlamaIndex | [@nova-sdk/adapter-llamaindex](https://www.npmjs.com/package/@nova-sdk/adapter-llamaindex) |  |
| Model Context Protocol | [@nova-sdk/adapter-model-context-protocol](https://www.npmjs.com/package/@nova-sdk/adapter-model-context-protocol) |  |

**Eliza, ZerePy and GAME have direct integrations on their respective repos.*

### Plugins
| Plugin | Tools | NPM package |
| --- | --- | --- |
| 0x | Get quotes and swap on 0x | [@nova-sdk/plugin-0x](https://www.npmjs.com/package/@nova-sdk/plugin-0x) |
| 1inch | Get the balances of a wallet using 1inch API | [@nova-sdk/plugin-1inch](https://www.npmjs.com/package/@nova-sdk/plugin-1inch) |
| Allora | Get price predictions using Allora API | [@nova-sdk/plugin-allora](https://www.npmjs.com/package/@nova-sdk/plugin-allora) |
| Avnu | Swap tokens on Starknet | [@nova-sdk/plugin-avnu](https://www.npmjs.com/package/@nova-sdk/plugin-avnu) |
| Balancer | Swap tokens and provide liquidity on Balancer | [@nova-sdk/plugin-balancer](https://www.npmjs.com/package/@nova-sdk/plugin-balancer) |
| Balmy | Swap tokens on Balmy | [@nova-sdk/plugin-balmy](https://www.npmjs.com/package/@nova-sdk/plugin-balmy) |
| BirdEye | Get token insights using BirdEye API | [@nova-sdk/plugin-birdeye](https://www.npmjs.com/package/@nova-sdk/plugin-birdeye) |
| CoinGecko | Get coin information using CoinGecko API | [@nova-sdk/plugin-coingecko](https://www.npmjs.com/package/@nova-sdk/plugin-coingecko) |
| Coinmarketcap | Get coin information using Coinmarketcap API | [@nova-sdk/plugin-coinmarketcap](https://www.npmjs.com/package/@nova-sdk/plugin-coinmarketcap) |
| Cosmosbank | Interact with Cosmos tokens | [@nova-sdk/plugin-cosmosbank](https://www.npmjs.com/package/@nova-sdk/plugin-cosmosbank) |
| Crossmint Headless Checkout | Purchase any NFT on any chain using Crossmint | [@nova-sdk/plugin-crossmint-headless-checkout](https://www.npmjs.com/package/@nova-sdk/plugin-crossmint-headless-checkout) |
| Crossmint Mint, Faucet, Wallets | Create a wallet, mint tokens and get test tokens on any chain using Crossmint | [@nova-sdk/plugin-crossmint-mint-faucet-wallets](https://www.npmjs.com/package/@nova-sdk/plugin-crossmint-mint-faucet-wallets) |
| DeBridge | Bridge tokens on DeBridge | [@nova-sdk/plugin-debridge](https://www.npmjs.com/package/@nova-sdk/plugin-debridge) |
| Dexscreener | Get token information using Dexscreener API | [@nova-sdk/plugin-dexscreener](https://www.npmjs.com/package/@nova-sdk/plugin-dexscreener) |
| ERC20 | Interact with any ERC20 token | [@nova-sdk/plugin-erc20](https://www.npmjs.com/package/@nova-sdk/plugin-erc20) |
| ERC721 | Interact with any ERC721 token | [@nova-sdk/plugin-erc721](https://www.npmjs.com/package/@nova-sdk/plugin-erc721) |
| Etherscan | Get transaction information using Etherscan API | [@nova-sdk/plugin-etherscan](https://www.npmjs.com/package/@nova-sdk/plugin-etherscan) |
| Farcaster | Read and post casts on Farcaster | [@nova-sdk/plugin-farcaster](https://www.npmjs.com/package/@nova-sdk/plugin-farcaster) |
| Ionic | Borrow and lend on Ionic | [@nova-sdk/plugin-ionic](https://www.npmjs.com/package/@nova-sdk/plugin-ionic) |
| Ironclad | Create positions on Ironclad | [@nova-sdk/plugin-ironclad](https://www.npmjs.com/package/@nova-sdk/plugin-ironclad) |
| JSON RPC | Call any JSON RPC endpoint |[@nova-sdk/plugin-json-rpc](https://www.npmjs.com/package/@nova-sdk/plugin-json-rpc) |  |
| Jupiter | Swap tokens on Jupiter | [@nova-sdk/plugin-jupiter](https://www.npmjs.com/package/@nova-sdk/plugin-jupiter) |
| KIM | Swap tokens on KIM | [@nova-sdk/plugin-kim](https://www.npmjs.com/package/@nova-sdk/plugin-kim) |
| Lulo | Deposit USDC on Lulo | [@nova-sdk/plugin-lulo](https://www.npmjs.com/package/@nova-sdk/plugin-lulo) |
| Meteora | Create liquidity pools on Meteora | [@nova-sdk/plugin-meteora](https://www.npmjs.com/package/@nova-sdk/plugin-meteora) |
| Mode Governance | Create a governance proposal on Mode | [@nova-sdk/plugin-mode-governance](https://www.npmjs.com/package/@nova-sdk/plugin-mode-governance) |
| Mode Voting | Vote on a governance proposal on Mode | [@nova-sdk/plugin-mode-voting](https://www.npmjs.com/package/@nova-sdk/plugin-mode-voting) |
| Mode Spray | Spray tokens on Mode | [@nova-sdk/plugin-mode-spray](https://www.npmjs.com/package/@nova-sdk/plugin-mode-spray) |
| Nansen | Get Nansen information using Nansen API | [@nova-sdk/plugin-nansen](https://www.npmjs.com/package/@nova-sdk/plugin-nansen) |
| OpenSea | Get nft and sales information using OpenSea API | [@nova-sdk/plugin-opensea](https://www.npmjs.com/package/@nova-sdk/plugin-opensea) |
| Orca | Create positions on Orca | [@nova-sdk/plugin-orca](https://www.npmjs.com/package/@nova-sdk/plugin-orca) |
| Polymarket | Bet on Polymarket | [@nova-sdk/plugin-polymarket](https://www.npmjs.com/package/@nova-sdk/plugin-polymarket) |
| Pump.fun | Launch a token on Pump.fun | [@nova-sdk/plugin-pump-fun](https://www.npmjs.com/package/@nova-sdk/plugin-pump-fun) |
| Renzo | Create a position on Renzo | [@nova-sdk/plugin-renzo](https://www.npmjs.com/package/@nova-sdk/plugin-renzo) |
| Rugcheck | Check SPL token validity on Rugcheck | [@nova-sdk/plugin-rugcheck](https://www.npmjs.com/package/@nova-sdk/plugin-rugcheck) |
| SNS | Interact with SNS | [@nova-sdk/plugin-sns](https://www.npmjs.com/package/@nova-sdk/plugin-sns) |
| Solana Magic Eden | Purchase NFTs on Magic Eden | [@nova-sdk/plugin-solana-magiceden](https://www.npmjs.com/package/@nova-sdk/plugin-solana-magiceden) |
| Solana NFTs | Get NFT information using Solana NFTs API | [@nova-sdk/plugin-solana-nfts](https://www.npmjs.com/package/@nova-sdk/plugin-solana-nfts) |  |
| SPL Tokens | Interact with SPL tokens | [@nova-sdk/plugin-spl-token](https://www.npmjs.com/package/@nova-sdk/plugin-spl-token) |  |
| Starknet Token | Interact with Starknet tokens | [@nova-sdk/plugin-starknet-token](https://www.npmjs.com/package/@nova-sdk/plugin-starknet-token) |  |
| Superfluid | Create streams with Superfluid | [@nova-sdk/plugin-superfluid](https://www.npmjs.com/package/@nova-sdk/plugin-superfluid) |  |
| Tensor | Purchase tokens on Tensor | [@nova-sdk/plugin-tensor](https://www.npmjs.com/package/@nova-sdk/plugin-tensor) |  |
| Uniswap | Swap tokens on Uniswap | [@nova-sdk/plugin-uniswap](https://www.npmjs.com/package/@nova-sdk/plugin-uniswap) |  |
| Velodrome | Create a position on Velodrome | [@nova-sdk/plugin-velodrome](https://www.npmjs.com/package/@nova-sdk/plugin-velodrome) |  |
| Worldstore | Purchase physical assets on Worldstore | [@nova-sdk/plugin-worldstore](https://www.npmjs.com/package/@nova-sdk/plugin-worldstore) |  |
| ZeroDev Global Address | Create a global address on ZeroDev | [@nova-sdk/plugin-zero-dev-global-address](https://www.npmjs.com/package/@nova-sdk/plugin-zero-dev-global-address) |  |
| Zilliqa | Interact with Zilliqa | [@nova-sdk/plugin-zilliqa](https://www.npmjs.com/package/@nova-sdk/plugin-zilliqa) |  |

