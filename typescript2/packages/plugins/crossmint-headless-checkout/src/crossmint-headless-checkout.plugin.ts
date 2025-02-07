import { Crossmint, CrossmintApiClient, createCrossmint } from "@crossmint/common-sdk-base";
import { Chain, PluginBase, createTool } from "@nova-sdk/core";
import { z } from "zod";

import { EVMWalletClient } from "@nova-sdk/wallet-evm";

import { Order } from "@crossmint/client-sdk-base";
import { parseTransaction } from "viem";
import packageJson from "../package.json";
import { getCreateAndPayOrderParameters } from "./parameters";

export class CrossmintHeadlessCheckoutPlugin extends PluginBase {
    private readonly crossmintApiClient: CrossmintApiClient;

    constructor(
        private readonly crossmint: Crossmint,
        private readonly callDataSchema?: z.ZodSchema,
    ) {
        super("crossmint-headless-checkout", []);

        const validatedCrossmint = createCrossmint(crossmint, {
            usageOrigin: "server",
        });
        this.crossmintApiClient = new CrossmintApiClient(validatedCrossmint, {
            internalConfig: {
                sdkMetadata: {
                    name: "@nova-sdk/plugin-crossmint-headless-checkout",
                    version: packageJson.version,
                },
            },
        });
    }

    supportsChain(chain: Chain): boolean {
        return true;
    }

    async getTools(walletClient: EVMWalletClient) {
        const superTools = await super.getTools(walletClient);
        return [
            ...superTools,
            createTool(
                {
                    name: "buy_token",
                    description: "Buy a token such as an NFT, SFT or item tokenized by them, listed on any blockchain",
                    parameters: getCreateAndPayOrderParameters(this.callDataSchema),
                },
                async (params) => {
                    const res = await this.crossmintApiClient.post("/api/2022-06-09/orders", {
                        body: JSON.stringify(params),
                        headers: {
                            "x-api-key": this.crossmint.apiKey,
                            "Content-Type": "application/json",
                        },
                    });

                    if (!res.ok) {
                        let errorMessage = `Failed to create buy order: ${res.status} ${res.statusText}`;
                        try {
                            const json = await res.json();
                            errorMessage += `\n\n${JSON.stringify(json, null, 2)}`;
                        } catch (e) {
                            console.error("Failed to parse JSON response:", e);
                        }
                        throw new Error(errorMessage);
                    }

                    const { order } = (await res.json()) as {
                        order: Order;
                        orderClientSecret: string;
                    };

                    console.log("Created order:", order.orderId);

                    const isInsufficientFunds = order.payment.status === "crypto-payer-insufficient-funds";
                    if (isInsufficientFunds) {
                        throw new Error("Insufficient funds");
                    }

                    const isRequiresPhysicalAddress = order.quote.status === "requires-physical-address";
                    if (isRequiresPhysicalAddress) {
                        throw new Error("recipient.physicalAddress is required");
                    }

                    const serializedTransaction =
                        order.payment.preparation != null && "serializedTransaction" in order.payment.preparation
                            ? order.payment.preparation.serializedTransaction
                            : undefined;
                    if (!serializedTransaction) {
                        throw new Error(
                            `No serialized transaction found for order, this item may not be available for purchase:\n\n ${JSON.stringify(
                                order,
                                null,
                                2,
                            )}`,
                        );
                    }

                    const transaction = parseTransaction(serializedTransaction as `0x${string}`);

                    if (transaction.to == null) {
                        throw new Error("Transaction to is null");
                    }

                    console.log("Paying order:", order.orderId);

                    const sendRes = await walletClient.sendTransaction({
                        to: transaction.to,
                        value: transaction.value || 0n,
                        data: transaction.data,
                    });
                    return { order, txId: sendRes.hash };
                },
            ),
        ];
    }
}

export const crossmintHeadlessCheckout = (crossmint: Crossmint, callDataSchema?: z.ZodSchema) => {
    return new CrossmintHeadlessCheckoutPlugin(crossmint, callDataSchema);
};
