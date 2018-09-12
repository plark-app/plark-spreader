import { Coin } from '@berrywallet/core';
import { DataTypeAbstract, DefineAttributeColumnOptions, FindOptions, Instance } from 'sequelize';

declare global {
    type SequelizeAttributes<T extends { [key: string]: any }> = {
        [P in keyof T]: string | DataTypeAbstract | DefineAttributeColumnOptions;
    };

    type UserAttributes = {
        token: string;
    };

    type PlatformAttributes = {
        id?: number;
        user_token: string;
        type: Platform;
        token: string;
    };

    type AddressAttributes = {
        id?: number;
        coin: Coin.Unit;
        address: string;
    };


    type UserInstance = Instance<UserAttributes> & {
        getPlatforms(findOption?: FindOptions<PlatformAttributes>): Promise<PlatformInstance[]>;
    };

    type PlatformInstance = Instance<PlatformAttributes> & {
        getUser(findOption?: FindOptions<UserAttributes>): Promise<UserInstance>;

        setAddresses(addresses: AddressInstance[]): Promise<AddressInstance[]>;
    }

    type AddressInstance = Instance<AddressAttributes> & {
        getPlatform(findOption?: FindOptions<PlatformAttributes>): Promise<PlatformInstance>;
    }
}
