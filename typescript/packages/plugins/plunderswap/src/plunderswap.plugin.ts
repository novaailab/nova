import { type Chain, PluginBase } from "@nova-sdk/core";
import { PlunderSwapService } from "./plunderswap.service";

export class PlunderSwapPlugin extends PluginBase {
    constructor() {
        super("plunderswap", [new PlunderSwapService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "zilliqa";
}

export function plunderswap() {
    return new PlunderSwapPlugin();
}
