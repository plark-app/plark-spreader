import { Coin } from '@berrywallet/core';
import { PlatformModel } from 'models';
import * as AddressProvider from './address-provider';

export async function getUserPlatform(user: UserInstance, type: Platform, token: string): Promise<PlatformInstance> {
    let [platform] = await user.getPlatforms({
        where: {
            type: type,
            token: token,
        },
    });

    if (platform) {
        return platform;
    }

    return await PlatformModel.create({
        user_token: user.get('token'),
        type: type,
        token: token,
    });
}


export async function resolveAddresses(platform: PlatformInstance, coin: Coin.Unit, addrs: string[]): Promise<string[]> {

    await unsubscribeAddresses(platform, coin);

    const addresses = await Promise.all<AddressInstance>(addrs.map(
        (addr: string) => AddressProvider.getAddress(coin, addr),
    ));

    await platform.addAddresses(addresses);

    return addrs;
}

export async function unsubscribeAddresses(platform: PlatformInstance, coin: Coin.Unit): Promise<void> {
    const existsAddresses = await platform.getAddresses({
        where: {
            coin: coin,
        },
    });

    await platform.removeAddresses(existsAddresses);
}
