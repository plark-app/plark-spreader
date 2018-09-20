import { EventEmitter } from 'events';
import { map, debounce } from 'lodash';
import { Coin } from '@berrywallet/core';
import { Events } from 'common/events';

import { AddressProvider } from 'common/providers';
import { ConsoleColor } from 'common/console';
import { createTracker } from 'common/coin-tracker/coin-tracker';
import { CoinTracker, TransactionHandler, TransactionInfo } from 'common/coin-tracker/types';


export class CoinTrackerPool {
    protected trackers: Record<Coin.Unit, CoinTracker>;
    protected startTime: Date;
    protected eventEmitter: EventEmitter;

    public constructor(coinList: Coin.Unit[], eventEmitter: EventEmitter) {
        this.trackers = {} as Record<Coin.Unit, CoinTracker>;
        this.startTime = new Date();
        this.eventEmitter = eventEmitter;

        coinList.forEach((coin: Coin.Unit) => {
            try {
                this.trackers[coin] = createTracker(coin);
            } catch (error) {
                console.log(ConsoleColor.FgRed, error.message, ConsoleColor.Reset);
                return;
            }

            eventEmitter.on(`${Events.UpdateCoin}:${coin}`, debounce(this.updateAddressList(coin), 500));
        });
    }

    public async start(): Promise<void> {
        const promisesList = map(this.trackers, async (tracker: CoinTracker): Promise<void> => {
            const addrs = await CoinTrackerPool.getAddresses(tracker.getCoin());
            tracker.setAddresses(addrs);

            try {
                tracker.onReceiveTransaction(this.handleTransaction);
                return await tracker.start();
            } catch (error) {
                console.log(`${ConsoleColor.FgRed}${error.message}${ConsoleColor.Reset}`);
                return;
            }
        });

        await Promise.all(promisesList);
    }

    public getTracker(coin: Coin.Unit): CoinTracker {
        return this.trackers[coin];
    }

    static async getAddresses(coin: Coin.Unit): Promise<string[]> {
        const addrInstances = await AddressProvider.getAddresses(coin);

        return addrInstances.map((addr: AddressInstance) => addr.address);
    }

    protected updateAddressList = (coin: Coin.Unit) => {
        return async () => {
            const tracker = this.getTracker(coin);

            const addrs = await CoinTrackerPool.getAddresses(coin);
            tracker.setAddresses(addrs);
        };
    };

    protected handleTransaction: TransactionHandler = (coin: Coin.Unit, addresses: string[], txInfo: TransactionInfo) => {
        this.eventEmitter.emit(Events.HandleTX, coin, addresses, txInfo);
    };
}
