import Sequalize from 'sequelize';
import { db } from 'common/database';

const attributes: SequelizeAttributes<block.BlockAttributes> = {
    id: {
        type: Sequalize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    coin: {
        type: Sequalize.STRING,
    },
    hash: {
        type: Sequalize.STRING,
    },
    height: {
        type: Sequalize.INTEGER,
    },
    blocktime: {
        type: Sequalize.INTEGER,
    },
    original: {
        type: Sequalize.JSON,
        allowNull: true,
    },
};

export const BlockModel = db.define<block.BlockInstance, block.BlockAttributes>(
    'blocks',
    attributes,
    { underscored: true },
);
