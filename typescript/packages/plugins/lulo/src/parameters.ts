import { createToolParameters } from "@nova-sdk/core";
import { z } from "zod";

export class DepositUSDCParameters extends createToolParameters(
    z.object({
        amount: z.string().describe("Amount of USDC to deposit"),
    }),
) {}
