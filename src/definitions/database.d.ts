import { Coin } from '@plark/wallet-core';
import {
    Instance,

    DataTypeAbstract,
    DefineAttributeColumnOptions,

    BelongsToManyGetAssociationsMixin,
    BelongsToManySetAssociationsMixin,
    BelongsToManyAddAssociationsMixin,
    BelongsToManyRemoveAssociationsMixin,

    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
} from 'sequelize';

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
        sync_counter: number;
        token: string;
    };

    type AddressAttributes = {
        id?: number;
        coin: Coin.Unit;
        address: string;
    };


    type UserInstance = Instance<UserAttributes> & UserAttributes & {
        getPlatforms: BelongsToManyGetAssociationsMixin<PlatformInstance>;
    };

    type PlatformInstance = Instance<PlatformAttributes> & PlatformAttributes & {
        Addresses?: AddressInstance[];

        getAddresses: BelongsToManyGetAssociationsMixin<AddressInstance>;
        setAddresses: BelongsToManySetAssociationsMixin<AddressInstance>;
        addAddresses: BelongsToManyAddAssociationsMixin<AddressInstance>;
        removeAddresses: BelongsToManyRemoveAssociationsMixin<AddressInstance>;

        getUser: BelongsToGetAssociationMixin<UserInstance>;
        setUser: BelongsToSetAssociationMixin<UserInstance>;
    }

    type AddressInstance = Instance<AddressAttributes> & AddressAttributes & {
        getPlatforms: BelongsToManyGetAssociationsMixin<PlatformInstance>;
    }
}
