import Sequalize from 'sequelize';
import { UserModel } from './user';
import { PlatformModel } from './platform';
import { AddressModel } from './address';
import { BlockModel } from './blocks';
import { TransactionModel } from './transactions';


export const modelList: Sequalize.Models = {
    users: UserModel,
    platforms: PlatformModel,
    addresses: AddressModel,
    blocks: BlockModel,
    transactions: TransactionModel,
};


export { UserModel, PlatformModel, AddressModel, BlockModel, TransactionModel };
