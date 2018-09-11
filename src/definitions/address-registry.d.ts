import { Coin } from '@berrywallet/core';

declare global {

    type Platform = 'ios' | 'android' | 'chrome';

    type SubscriptionParams = {
        userToken: string;
        platform: Platform;
        platformToken: string;
    };

    type CoinRegistryMap<V = any> = Record<Coin.Unit | string, V>;
    type AddressRegistryMap = Record<string, SubscriptionParams[]>;
}

export {};