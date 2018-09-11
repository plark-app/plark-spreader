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

    public subscribe(coin: Coin.Unit, addresses: string[], params: SubscriptionParams): void {
        const addrReg = this.getAddressRegistry(coin);

        addresses.forEach((addr: string) => {
            addrReg[addr] = [
                ...addrReg[addr],
                params,
            ];
        });
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
