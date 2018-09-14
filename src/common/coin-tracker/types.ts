import { Coin } from '@berrywallet/core';

export type TransactionInfo = {
    txid: string;
    [key: string]: any;
}

export type TransactionHandler = (coin: Coin.Unit, addresses: string[], transactionInfo: TransactionInfo) => void;

export interface CoinTracker {
    getCoin(): Coin.Unit;

    start(): Promise<void>;

    setAddresses(addresses: string[]): void;

    onReceiveTransaction(txHandler: TransactionHandler): void;
}
