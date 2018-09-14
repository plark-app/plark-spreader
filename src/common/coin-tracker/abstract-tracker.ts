import { Coin } from '@berrywallet/core';
import { CoinTracker, TransactionHandler } from './types';

export abstract class AbstractTracker implements CoinTracker {
    protected coin: Coin.Unit;
    protected isActive: boolean = false;
    protected addresses: string[] = [];
    protected txHandler?: TransactionHandler;

    public constructor(coin: Coin.Unit) {
        this.coin = coin;
    }

    public getCoin(): Coin.Unit {
        return this.coin;
    }

    public async start(): Promise<void> {
        if (this.isActive) {
            return;
        }

        this.isActive = true;
    }

    public setAddresses(addresses: string[]): void {
        const oldCount = this.addresses.length;

        this.addresses = addresses;

        if (this.isActive) {
            console.log(`[${this.coin}] Changed addresses list (${oldCount} -> ${addresses.length})`);
        }
    }

    public onReceiveTransaction(txHandler: TransactionHandler): void {
        this.txHandler = txHandler;
    }

    protected handleNewTransaction = (): void => {
        if (!this.txHandler) {
            return;
        }
    };
}
