import { Coin } from '@plark/wallet-core';

import { CoinTracker } from './types';
import { CoinTrackerPool } from './tracker-pool';
import { EthereumCoinTracker } from './ethereum-coin-tracker';
import { BIPCoinTracker } from './bip-coin-tracker';


export { CoinTracker, CoinTrackerPool };

export function createTracker(coin: Coin.Unit): CoinTracker {
    switch (coin) {
        case Coin.Unit.ETH:
        case Coin.Unit.ETHt:
            return new EthereumCoinTracker(coin);

        case Coin.Unit.BTC:
        case Coin.Unit.BTCt:
        case Coin.Unit.LTC:
        case Coin.Unit.LTCt:
        case Coin.Unit.DASH:
        case Coin.Unit.DASHt:
            return new BIPCoinTracker(coin);
    }

    throw new Error(`[${coin}] Can not create tracker`);
}


export async function startTransactionTracking(coinList: Coin.Unit[]): Promise<CoinTrackerPool> {
    const coinTrackerPool = new CoinTrackerPool(coinList);
    await coinTrackerPool.start();

    return coinTrackerPool;
}
