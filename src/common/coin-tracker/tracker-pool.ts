import { map, debounce, forEach } from 'lodash';
import { Coin } from '@berrywallet/core';
import { EventEmitter } from 'events';

import { AddressProvider } from 'common/providers';
import { ConsoleColor } from 'common/console';
import { createTracker } from 'common/coin-tracker/coin-tracker';
import { CoinTracker } from 'common/coin-tracker/types';

const clear = require('clear');


export class CoinTrackerPool {
    protected trackers: Record<Coin.Unit, CoinTracker>;
    protected startTime: Date;

    public constructor(coinList: Coin.Unit[], eventEmitter: EventEmitter) {
        this.trackers = {} as Record<Coin.Unit, CoinTracker>;
        this.startTime = new Date();

        coinList.forEach((coin: Coin.Unit) => {
            try {
                this.trackers[coin] = createTracker(coin);
            } catch (error) {
                console.log(ConsoleColor.FgRed, error.message, ConsoleColor.Reset);
                return;
            }

            eventEmitter.on(`update-coin:${coin}`, debounce(this.updateAddressList(coin), 500));
        });
    }

    public async start(): Promise<void> {
        const promisesList = map(this.trackers, async (tracker: CoinTracker): Promise<void> => {
            const addrs = await CoinTrackerPool.getAddresses(tracker.getCoin());
            tracker.setAddresses(addrs);

            try {
                return await tracker.start();
            } catch (error) {
                console.log(`${ConsoleColor.FgRed}${error.message}${ConsoleColor.Reset}`);
                return;
            }
        });

        await Promise.all(promisesList);

        setInterval(() => {
            clear();

            const coinList: any = {};

            forEach(this.trackers, (tracker: CoinTracker) => {
                const row: any = {};

                const lastBlock = tracker.getLastBlock();
                if (lastBlock) {
                    const blockSpendTime = (lastBlock.time.getTime() - this.startTime.getTime()) / (1000 * 60);
                    row['Block Hash'] = lastBlock.hash;
                    row['Block Time'] = lastBlock.time.toLocaleTimeString();
                    row['Blocks / Min'] = Math.floor((lastBlock.index / blockSpendTime));
                }

                const lastTx = tracker.getLastTransaction();
                if (lastTx) {
                    const txSpendTime = (lastTx.time.getTime() - this.startTime.getTime()) / (1000 * 60);
                    row['TX Hash'] = lastTx.hash;
                    row['TX Time'] = lastTx.time.toLocaleTimeString();
                    row['TXs / Min'] = Math.floor((lastTx.index / txSpendTime));
                }

                coinList[tracker.getCoin()] = row;
            });

            console.table(coinList);
        }, 500);
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
}
