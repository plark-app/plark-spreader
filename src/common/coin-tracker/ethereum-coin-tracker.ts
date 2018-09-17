import { Coin } from '@berrywallet/core';
import { AbstractTracker } from './abstract-tracker';

export class EthereumCoinTracker extends AbstractTracker {
    public constructor(coin: Coin.Unit) {
        super(coin);
    }

    public async start(): Promise<void> {
        await super.start();

        console.log(`[${this.coin}]`, `Start track ${this.addresses.length} addrs`);
    }
}
