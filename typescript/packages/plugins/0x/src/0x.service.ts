import { Tool } from "@nova-sdk/core";
import { EVMWalletClient } from "@nova-sdk/wallet-evm";
import { GetQuoteParameters } from "./parameters";

export class ZeroExService {
    constructor(private readonly apiKey: string) {}

    private async makeRequest(queryParams: Record<string, string | undefined>) {
        const filteredParams = Object.fromEntries(
            Object.entries(queryParams).filter(([_, v]) => v !== undefined),
        ) as Record<string, string>;

        const url = new URL(
            `https://api.0x.org/swap/allowance-holder/quote?${new URLSearchParams(filteredParams).toString()}`,
        );

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "0x-api-key": this.apiKey,
                "0x-version": "v2",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${JSON.stringify(await response.text(), null, 2)}`);
        }

        return response.json();
    }

    @Tool({
        name: "0x_getQuote",
        description: "Get a quote for a swap from 0x",
    })
    async getQuote(walletClient: EVMWalletClient, parameters: GetQuoteParameters) {
        const queryParams = {
            chainId: walletClient.getChain().id.toString(),
            sellToken: parameters.sellToken,
            buyToken: parameters.buyToken,
            sellAmount: parameters.sellAmount,
            taker: walletClient.getAddress(),
            txOrigin: walletClient.getAddress(),
            slippageBps: parameters.slippageBps?.toString(),
        };

        return await this.makeRequest(queryParams);
    }

    @Tool({
        name: "0x_swap",
        description: "Swap tokens using 0x",
    })
    async swap(walletClient: EVMWalletClient, parameters: GetQuoteParameters) {
        const quote = await this.getQuote(walletClient, parameters);

        const transaction = quote.transaction;

        const tx = await walletClient.sendTransaction({
            to: transaction.to,
            value: transaction.value,
            data: transaction.data,
        });

        return tx.hash;
    }

    @Tool({
        name: "0x_get_contract_address_to_give_allowance_for_swap",
        description: "Get the contract address to give allowance for a swap",
    })
    async getContractAddressToGiveAllowanceForSwap(walletClient: EVMWalletClient, parameters: GetQuoteParameters) {
        return "0x0000000000001fF3684f28c67538d4D072C22734";
    }
}
