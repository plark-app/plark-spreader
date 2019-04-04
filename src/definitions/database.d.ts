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

    type UserInstance
        = Instance<UserAttributes>
        & UserAttributes
        & {
        getPlatforms: BelongsToManyGetAssociationsMixin<PlatformInstance>;
    };


    type PlatformAttributes = {
        id?: number;
        user_token: string;
        type: Platform;
        sync_counter: number;
        token: string;
    };

    type PlatformInstance
        = Instance<PlatformAttributes>
        & PlatformAttributes
        & {
        Addresses?: AddressInstance[];

        getAddresses: BelongsToManyGetAssociationsMixin<AddressInstance>;
        setAddresses: BelongsToManySetAssociationsMixin<AddressInstance>;
        addAddresses: BelongsToManyAddAssociationsMixin<AddressInstance>;
        removeAddresses: BelongsToManyRemoveAssociationsMixin<AddressInstance>;

        getUser: BelongsToGetAssociationMixin<UserInstance>;
        setUser: BelongsToSetAssociationMixin<UserInstance>;
    }


    type AddressAttributes = {
        id?: number;
        coin: Coin.Unit;
        address: string;
    };

    type AddressInstance
        = Instance<AddressAttributes>
        & AddressAttributes
        & {
        getPlatforms: BelongsToManyGetAssociationsMixin<PlatformInstance>;
    }


    namespace block {
        type BlockAttributes = {
            id?: number;
            coin: Coin.Unit;
            hash: string;
            height: number;
            blocktime: number;
            original?: any;
        }

        type BlockInstance = Instance<BlockAttributes> & BlockAttributes;
    }


    namespace transaction {
        type TransactionAttributes = {
            id?: number;
            coin: Coin.Unit;
            txid: string;
            amount?: number;
        }

        type TransactionInstance
            = Instance<TransactionAttributes>
            & TransactionAttributes;
    }
}
