import { type Chain, PluginBase } from "@nova-sdk/core";
import { EVMWalletClient } from "@nova-sdk/wallet-evm";
import { base, mode, optimism } from "viem/chains";
import { IonicService } from "./ionic.service";

export class IonicPlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("ionic", [new IonicService()]);
    }

    supportsChain(chain: Chain): boolean {
        return chain.type === "evm" && (chain.id === mode.id || chain.id === base.id || chain.id === optimism.id);
    }
}

export function ionic() {
    return new IonicPlugin();
}
