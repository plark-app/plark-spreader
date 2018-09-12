import Sequalize from 'sequelize';
import { db } from 'common/database';

const attributes: SequelizeAttributes<UserAttributes> = {
    token: {
        primaryKey: true,
        allowNull: false,
        type: Sequalize.STRING,
    },
};


export const UserModel = db.define<UserInstance, UserAttributes>(
    'users',
    attributes,
    { underscored: true },
);
