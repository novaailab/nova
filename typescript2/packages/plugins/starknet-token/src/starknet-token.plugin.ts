import { Chain, PluginBase } from "@nova-sdk/core";
import { StarknetWalletClient } from "@nova-sdk/wallet-starknet";
import { StarknetTokenService } from "./starknet-token.service";
import { StarknetTokenPluginCtorParams } from "./types/StarknetTokenPluginCtorParams";

export class StarknetTokenPlugin extends PluginBase<StarknetWalletClient> {
    constructor({ tokens }: StarknetTokenPluginCtorParams) {
        super("starknet-token", [new StarknetTokenService({ tokens })]);
    }

    supportsChain(chain: Chain): boolean {
        return chain.type === "starknet";
    }
}

export function starknetToken({ tokens }: StarknetTokenPluginCtorParams) {
    return new StarknetTokenPlugin({ tokens });
}
