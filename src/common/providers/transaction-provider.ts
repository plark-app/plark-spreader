import { Coin } from '@plark/wallet-core';
import { TransactionModel } from 'models';

export async function newTransaction(coin: Coin.Unit,
                                     txid: string,
                                     amount: number): Promise<transaction.TransactionInstance> {

    const [txInstance] = await TransactionModel.findOrCreate({
        where: {
            coin: coin,
            txid: txid,
        },
        defaults: {
            coin: coin,
            txid: txid,
            amount: amount,
        },
    });

    return txInstance;
}
