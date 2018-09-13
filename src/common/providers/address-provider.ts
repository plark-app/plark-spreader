import { Coin } from '@berrywallet/core';
import { AddressModel, PlatformModel } from 'models';
import { FindOptions } from 'sequelize';

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

export async function getAddresses(coin: Coin.Unit, onlyActive: boolean = true) {

    const requestParams: FindOptions<AddressAttributes> = {
        where: {
            coin: coin,
        },
    };

    if (onlyActive) {
        requestParams.include = [{
            model: PlatformModel,
            as: 'Platforms',
            required: true,
        }];
    }

    return AddressModel.findAll(requestParams);
}
