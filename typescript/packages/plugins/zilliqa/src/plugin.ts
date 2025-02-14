import { type Chain, PluginBase } from "@nova-sdk/core";
import type { ZilliqaWalletClient } from "@nova-sdk/wallet-zilliqa";
import { ZilliqaService } from "./zilliqa.service";

export class ZilliqaPlugin extends PluginBase<ZilliqaWalletClient> {
    constructor() {
        super("zilliqa", [new ZilliqaService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "zilliqa";
}

export function zilliqa() {
    return new ZilliqaPlugin();
}
