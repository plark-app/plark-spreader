import Sequalize from 'sequelize';
import { db } from 'common/database';
import { UserModel } from './user';

const attributes: SequelizeAttributes<PlatformAttributes> = {
    id: {
        type: Sequalize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    user_token: {
        type: Sequalize.STRING,
        allowNull: false,
    },
    type: {
        type: Sequalize.STRING,
    },
    token: {
        type: Sequalize.STRING,
    },
};


export const PlatformModel = db.define<PlatformInstance, PlatformAttributes>(
    'platforms',
    attributes,
    { underscored: true },
);

PlatformModel.belongsTo(UserModel, {
    as: 'User',
    keyType: Sequalize.STRING,
    foreignKey: 'user_token',
    targetKey: 'token',
});

UserModel.hasMany(PlatformModel, {
    as: 'Platforms',
    keyType: Sequalize.STRING,
    foreignKey: 'user_token',
    sourceKey: 'token',
});
