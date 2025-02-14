import { type Chain, PluginBase } from "@nova-sdk/core";
import { JupiterService } from "./jupiter.service";

export class JupiterPlugin extends PluginBase {
    constructor() {
        super("jupiter", [new JupiterService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "solana";
}

export const jupiter = () => new JupiterPlugin();
