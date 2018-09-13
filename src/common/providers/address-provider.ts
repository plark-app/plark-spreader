import { Coin } from '@berrywallet/core';
import { AddressModel } from 'models';

export async function getAddress(coin: any, addr: string): Promise<AddressInstance> {
    const [addressInstance] = await AddressModel.findOrCreate({
        where: {
            coin: coin,
            address: addr,
        },
    });

    return addressInstance;
}

export async function getPlatformAddresses(platform: PlatformInstance, coin: Coin.Unit): Promise<string[]> {
    const list = await platform.getAddresses({
        where: {
            coin: coin,
        },
    });

    return list.map((addr: AddressInstance) => addr.get('address'));
}
