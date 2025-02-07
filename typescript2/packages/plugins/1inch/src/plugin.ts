import { PluginBase } from "@nova-sdk/core";
import { Chain } from "@nova-sdk/core";
import { EVMWalletClient } from "@nova-sdk/wallet-evm";
import { BalanceService } from "./service";

export type OneInchCtorParams = {
    apiKey: string;
};

export class OneInchPlugin extends PluginBase<EVMWalletClient> {
    constructor(params: OneInchCtorParams) {
        super("1inch", [new BalanceService(params)]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm";
}

export function oneInch(params: OneInchCtorParams) {
    return new OneInchPlugin(params);
}
