import { map, debounce } from 'lodash';
import { Coin } from '@plark/wallet-core';
import eventEmitter, { Events } from 'common/events';

import { AddressProvider } from 'common/providers';
import { createTracker } from 'common/coin-tracker/coin-tracker';
import { CoinTracker, TransactionHandler, TransactionInfo } from 'common/coin-tracker/types';
import logger from 'common/logger';


export class CoinTrackerPool {
    protected trackers: Record<Coin.Unit, CoinTracker>;
    protected startTime: Date;

    public constructor(coinList: Coin.Unit[]) {
        this.trackers = {} as Record<Coin.Unit, CoinTracker>;
        this.startTime = new Date();

        coinList.forEach((coin: Coin.Unit) => {
            try {
                this.trackers[coin] = createTracker(coin);
            } catch (error) {
                logger.error(error.message, error);
                return;
            }

            eventEmitter.on(
                `${Events.UpdateCoin}:${coin}`,
                debounce(() => this.updateAddressList(coin), 500),
            );
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
                logger.error(error.message, error);
                return;
            }
        });

        await Promise.all(promisesList);
    }


    public getTracker(coin: Coin.Unit): CoinTracker {
        return this.trackers[coin];
    }


    public static async getAddresses(coin: Coin.Unit): Promise<string[]> {
        const addrInstances = await AddressProvider.getAddresses(coin);

        return addrInstances.map((addr: AddressInstance) => addr.address);
    }


    protected updateAddressList = async (coin: Coin.Unit) => {
        const tracker = this.getTracker(coin);

        const addrs = await CoinTrackerPool.getAddresses(coin);
        tracker.setAddresses(addrs);
    };


    protected handleTransaction: TransactionHandler = (coin: Coin.Unit, addresses: string[], txInfo: TransactionInfo) => {
        eventEmitter.emit(Events.HandleTX, coin, addresses, txInfo);
    };
}
