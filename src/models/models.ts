import Sequalize from 'sequelize';
import { UserModel } from './user';
import { PlatformModel } from './platform';
import { AddressModel } from './address';


export const modelList: Sequalize.Models = {
    users: UserModel,
    platforms: PlatformModel,
    addresses: AddressModel,
};


export { UserModel, PlatformModel, AddressModel };
