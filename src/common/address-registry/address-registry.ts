import { find, map } from 'lodash';
import { Coin } from '@berrywallet/core';

export interface AddressRegistryInterface {
    subscribe(coin: Coin.Unit, addresses: string[], params: SubscriptionParams): void;

    getAddresses(coin: Coin.Unit): string[];

    getSubscriptionsByAddr(coin: Coin.Unit, addr: string): SubscriptionParams[];

    unsubscribeUser(userToken: string, platform?: Platform): void;
}

export class AddressRegistry implements AddressRegistryInterface {

    protected coinRegistry: CoinRegistryMap<AddressRegistryMap> = {};

    public getAddresses(coin: Coin.Unit): string[] {
        return Object.keys(this.getAddressRegistry(coin));
    }

    public getSubscriptionsByAddr(coin: Coin.Unit, addr: string): SubscriptionParams[] {
        const addrReg = this.getAddressRegistry(coin);

        return addrReg[addr] || [];
    }

    public getUserStatus(userToken: string): any {
        return map(this.coinRegistry, (addrRegistry: AddressRegistryMap, coin: Coin.Unit) => {
            return {
                user_token: userToken,
                coin: coin,
                address: addrRegistry,
            };
        });
    }

    public subscribe(coin: Coin.Unit, addresses: string[], params: SubscriptionParams): void {
        const addrReg = this.getAddressRegistry(coin);

        addresses.forEach((addr: string) => {
            if (!addrReg[addr]) {
                addrReg[addr] = [];
            }

            const existsSubscription = find(addrReg[addr], { platformToken: params.platformToken });
            if (existsSubscription) {
                return;
            }

            addrReg[addr].push(params);
        });

        console.log('Subscribed');
    }

    public unsubscribeUser(userToken: string, platform?: Platform): void {
        console.log(userToken, platform);
    }

    protected getAddressRegistry(coin: Coin.Unit): AddressRegistryMap {
        if (!this.coinRegistry[coin]) {
            this.coinRegistry[coin] = {};
        }

        return this.coinRegistry[coin];
    }
}
