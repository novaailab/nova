import { Tool } from "@nova-sdk/core";
import { SolanaWalletClient } from "@nova-sdk/wallet-solana";
import { DepositUSDCParameters } from "./parameters";

export class LuloService {
    @Tool({
        name: "lulo_deposit_usdc",
        description: "Deposit USDC into Lulo",
    })
    async depositUSDC(walletClient: SolanaWalletClient, parameters: DepositUSDCParameters) {
        const response = await fetch(`https://blink.lulo.fi/actions?amount=${parameters.amount}&symbol=USDC`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                account: walletClient.getAddress(),
            }),
        });

        const data = await response.json();

        const tx = await walletClient.sendRawTransaction(data.transaction);

        return tx.hash;
    }
}
