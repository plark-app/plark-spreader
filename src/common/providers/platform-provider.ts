import Sequelize from 'sequelize';
import { Coin } from '@plark/wallet-core';
import { AddressModel, PlatformModel } from 'models';
import * as AddressProvider from './address-provider';

export async function findUserPlatform(user: UserInstance, token: string): Promise<PlatformInstance | undefined> {
    let [platform] = await user.getPlatforms({
        where: {
            token: token,
        },
    });

    if (!platform) {
        return;
    }

    return platform;
}


export async function findPlatform(token: string) : Promise<PlatformInstance | undefined> {
    const platform = await PlatformModel.findOne({
        where: {
            token: token,
        },
    });

    if (!platform) {
        return;
    }

    return platform;
}


export async function resolveUserPlatform(user: UserInstance, token: string, type: Platform): Promise<PlatformInstance> {
    const platform = await findUserPlatform(user, token);

    if (platform) {
        return platform;
    }

    return await PlatformModel.create({
        user_token: user.get('token'),
        type: type,
        token: token,
        sync_counter: 0,
    });
}


export async function resolveAddresses(platform: PlatformInstance, coin: Coin.Unit, addrs: string[]): Promise<string[]> {

    await unsubscribeAddresses(platform, coin);

    const addresses = await Promise.all<AddressInstance>(addrs.map(
        (addr: string) => AddressProvider.getAddress(coin, addr),
    ));

    await platform.updateAttributes({ sync_counter: platform.sync_counter + 1 });

    await platform.addAddresses(addresses);

    return addrs;
}


export async function unsubscribeAddresses(platform: PlatformInstance, coin?: Coin.Unit): Promise<void> {

    const queryParams: Sequelize.BelongsToManyGetAssociationsMixinOptions = {};
    if (coin) {
        queryParams.where = {
            coin: coin,
        };
    }

    const existsAddresses = await platform.getAddresses(queryParams);

    await platform.removeAddresses(existsAddresses);
}


export async function getPlatfromsOfAddress(coin: Coin.Unit, addr: string): Promise<PlatformInstance[]> {
    const address = await AddressModel.find({
        where: {
            coin: coin,
            address: addr,
        },
    });

    if (!address) {
        return [];
    }

    return address.getPlatforms();
}


export async function getPlatformsOfAddresses(coin: Coin.Unit, addresses: string[], _onlyActive: boolean = false): Promise<PlatformInstance[]> {
    return await PlatformModel.findAll({
        include: [{
            model: AddressModel,
            as: 'Addresses',
            required: true,
            where: {
                coin: coin,
                address: {
                    [Sequelize.Op.in]: addresses,
                },
            },
        }],
    });
}
