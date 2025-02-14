import { type Chain, PluginBase } from "@nova-sdk/core";
import type { EVMWalletClient } from "@nova-sdk/wallet-evm";
import { fraxtal, metalL2, mode, optimism } from "viem/chains";
import { VelodromeService } from "./velodrome.service";

const SUPPORTED_CHAINS = [mode, optimism, fraxtal, metalL2];

export class VelodromePlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("velodrome", [new VelodromeService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id);
}

export const velodrome = () => new VelodromePlugin();
