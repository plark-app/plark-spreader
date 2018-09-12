import Sequalize from 'sequelize';
import { db } from 'common/database';
import { PlatformModel } from './platform';

const attributes: SequelizeAttributes<AddressAttributes> = {
    id: {
        type: Sequalize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    coin: {
        type: Sequalize.STRING,
    },
    address: {
        type: Sequalize.STRING,
    },
};

export const AddressModel = db.define<AddressInstance, AddressAttributes>(
    'addresses',
    attributes,
    { underscored: true },
);

AddressModel.belongsToMany(PlatformModel, {
    as: 'Platforms',
    through: 'address__platforms',
    foreignKey: 'address_id',
    otherKey: 'platform_id',
});

PlatformModel.belongsToMany(AddressModel, {
    as: 'Addresses',
    through: 'address__platforms',
    foreignKey: 'platform_id',
    otherKey: 'address_id',
});
