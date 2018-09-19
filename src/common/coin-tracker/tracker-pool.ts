import { EventEmitter } from 'events';
import { map, debounce, forEach } from 'lodash';
import { Coin } from '@berrywallet/core';
import Table from 'cli-table';

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

        setInterval(this.flushInterface, 500);
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

    protected flushInterface = () => {
        clear();

        const table = new Table({
            head: [
                'Coin',
                'Block Hash',
                'Block Time',
                'Blocks / Hour',
                'TX Hash',
                'TX Time',
                'TXs / Min',
            ],
        });

        forEach(this.trackers, (tracker: CoinTracker) => {
            const row: any[] = [tracker.getCoin()];

            const lastBlock = tracker.getLastBlock();
            if (lastBlock) {
                const blockSpendTime = (lastBlock.time.getTime() - this.startTime.getTime()) / (1000 * 60 * 60);
                row.push(lastBlock.hash);
                row.push(lastBlock.time.toLocaleTimeString());
                row.push(Math.floor((lastBlock.index / blockSpendTime)));
            } else {
                row.push(' -- ');
                row.push(' -- ');
                row.push(' -- ');
            }

            const lastTx = tracker.getLastTransaction();
            if (lastTx) {
                const txSpendTime = (lastTx.time.getTime() - this.startTime.getTime()) / (1000 * 60);
                row.push(lastTx.hash);
                row.push(lastTx.time.toLocaleTimeString());
                row.push(Math.floor((lastTx.index / txSpendTime)));
            } else {
                row.push(' -- ');
                row.push(' -- ');
                row.push(' -- ');
            }

            table.push(row);
        });

        console.log(table.toString());
    };
}
