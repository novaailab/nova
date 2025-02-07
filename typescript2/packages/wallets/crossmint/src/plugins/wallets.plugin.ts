import type { CrossmintApiClient } from "@crossmint/common-sdk-base";
import { Chain, PluginBase } from "@nova-sdk/core";
import type { EVMWalletClient } from "@nova-sdk/wallet-evm";
import { WalletsService } from "./wallets.service";

export class WalletsPlugin extends PluginBase<EVMWalletClient> {
    constructor(client: CrossmintApiClient) {
        super("wallets", [new WalletsService(client)]);
    }

    supportsChain(chain: Chain) {
        return true;
    }
}

export function walletsPlugin(client: CrossmintApiClient) {
    return () => {
        return new WalletsPlugin(client);
    };
}
