import { Coin } from '@berrywallet/core';

interface CoinTracker {
    coin: Coin.Unit;

    start(): Promise<void>;
}

export function createTracker(coin: Coin.Unit): CoinTracker {
    return {
        coin: coin,
        start: function () {
            return Promise.resolve();
        },
    };
}