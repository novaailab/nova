import crypto from "node:crypto";
import type { EVMWalletClient } from "@nova-sdk/wallet-evm";
import { polygon } from "viem/chains";
import { IntSide, Side, type TickSize } from "./api";

export function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function buildPolyHmacSignature(
    secret: string,
    timestamp: number,
    method: string,
    requestPath: string,
    body?: string,
): string {
    const message = `${timestamp}${method}${requestPath}${body ?? ""}`;
    const base64Secret = Buffer.from(secret, "base64");
    const hmac = crypto.createHmac("sha256", base64Secret);
    const signature = hmac.update(message).digest("base64");

    // Convert to URL-safe Base64
    return replaceAll(replaceAll(signature, "+", "-"), "/", "_");
}

const MSG_TO_SIGN = "This message attests that I control the given wallet";

export async function buildClobEip712Signature(
    walletClient: EVMWalletClient,
    timestamp: number,
    nonce: number,
): Promise<string> {
    const address = walletClient.getAddress();
    const domain = {
        name: "ClobAuthDomain",
        version: "1",
        chainId: walletClient.getChain().id ?? polygon.id,
    };

    const types = {
        ClobAuth: [
            { name: "address", type: "address" },
            { name: "timestamp", type: "string" },
            { name: "nonce", type: "uint256" },
            { name: "message", type: "string" },
        ],
    };

    const message = {
        address,
        timestamp: timestamp.toString(),
        nonce,
        message: MSG_TO_SIGN,
    };

    const signature = await walletClient.signTypedData({
        domain,
        types,
        primaryType: "ClobAuth",
        message,
    });

    return signature.signature;
}

export function appendSearchParams(
    url: URL,
    parameters: Record<string, string | number | boolean | (string | number | boolean)[]>,
) {
    for (const [key, value] of Object.entries(parameters)) {
        if (value !== undefined) {
            const paramName = camelToSnake(key);
            if (Array.isArray(value)) {
                for (const val of value) {
                    url.searchParams.append(paramName, String(val));
                }
            } else {
                url.searchParams.append(paramName, String(value));
            }
        }
    }
}

export function priceValid(price: number, tickSize: number): boolean {
    return price >= tickSize && price <= 1 - tickSize;
}

export interface RoundConfig {
    readonly price: number;
    readonly size: number;
    readonly amount: number;
}

export const ROUNDING_CONFIG: Record<TickSize, RoundConfig> = {
    "0.1": {
        price: 1,
        size: 2,
        amount: 3,
    },
    "0.01": {
        price: 2,
        size: 2,
        amount: 4,
    },
    "0.001": {
        price: 3,
        size: 2,
        amount: 5,
    },
    "0.0001": {
        price: 4,
        size: 2,
        amount: 6,
    },
};

export function getOrderRawAmounts(
    side: Side,
    size: number,
    price: number,
    roundConfig: RoundConfig,
): { side: IntSide; rawMakerAmt: number; rawTakerAmt: number } {
    const rawPrice = roundNormal(price, roundConfig.price);

    if (side === Side.BUY) {
        // force 2 decimals places
        const rawTakerAmt = roundDown(size, roundConfig.size);

        let rawMakerAmt = rawTakerAmt * rawPrice;
        if (decimalPlaces(rawMakerAmt) > roundConfig.amount) {
            rawMakerAmt = roundUp(rawMakerAmt, roundConfig.amount + 4);
            if (decimalPlaces(rawMakerAmt) > roundConfig.amount) {
                rawMakerAmt = roundDown(rawMakerAmt, roundConfig.amount);
            }
        }

        return {
            side: IntSide.BUY,
            rawMakerAmt,
            rawTakerAmt,
        };
    }

    const rawMakerAmt = roundDown(size, roundConfig.size);
    let rawTakerAmt = rawMakerAmt * rawPrice;
    if (decimalPlaces(rawTakerAmt) > roundConfig.amount) {
        rawTakerAmt = roundUp(rawTakerAmt, roundConfig.amount + 4);
        if (decimalPlaces(rawTakerAmt) > roundConfig.amount) {
            rawTakerAmt = roundDown(rawTakerAmt, roundConfig.amount);
        }
    }

    return {
        side: IntSide.SELL,
        rawMakerAmt,
        rawTakerAmt,
    };
}

export function roundNormal(num: number, decimals: number) {
    if (decimalPlaces(num) <= decimals) {
        return num;
    }
    return Math.round((num + Number.EPSILON) * 10 ** decimals) / 10 ** decimals;
}

export function roundDown(num: number, decimals: number) {
    if (decimalPlaces(num) <= decimals) {
        return num;
    }
    return Math.floor(num * 10 ** decimals) / 10 ** decimals;
}

export function roundUp(num: number, decimals: number) {
    if (decimalPlaces(num) <= decimals) {
        return num;
    }
    return Math.ceil(num * 10 ** decimals) / 10 ** decimals;
}

export function decimalPlaces(num: number) {
    if (Number.isInteger(num)) {
        return 0;
    }

    const arr = num.toString().split(".");
    if (arr.length <= 1) {
        return 0;
    }

    return arr[1].length;
}

export function getExpirationTimestamp(secondsToAdd: number) {
    const currentUnixTimestamp = Math.floor(Date.now() / 1000);
    const newUnixTimestamp = currentUnixTimestamp + secondsToAdd;

    return newUnixTimestamp;
}

function replaceAll(str: string, search: string, replace: string): string {
    return str.split(search).join(replace);
}

/**
 * Transforms market outcome data into a more usable format.
 * Takes a market object with separate arrays for prices, names and token IDs,
 * and combines them into a single array of outcome objects.
 * Each outcome object contains the price, name and token ID for that outcome.
 *
 * @param market - Market object containing outcomePrices, outcomes (names), and clobTokenIds arrays
 * @returns Transformed market object with combined outcomes array and other properties preserved
 */
export function transformMarketOutcomes<
    T extends {
        outcomePrices: string;
        outcomes: string;
        clobTokenIds: string;
    },
>(
    market: T,
): Omit<T, "outcomePrices" | "clobTokenIds"> & { outcomes: Array<{ price: string; name: string; tokenId: string }> } {
    const outcomePrices_ = JSON.parse(market.outcomePrices);
    const outcomes_ = JSON.parse(market.outcomes);
    const clobTokenIds_ = JSON.parse(market.clobTokenIds);

    const transformedOutcomes = outcomePrices_.map((price: string, index: number) => ({
        price,
        name: outcomes_[index],
        tokenId: clobTokenIds_[index],
    }));

    const { outcomePrices, clobTokenIds, ...rest } = market;
    return {
        ...rest,
        outcomes: transformedOutcomes,
    };
}
