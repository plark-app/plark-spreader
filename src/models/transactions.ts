import Sequalize from 'sequelize';
import { db } from 'common/database';

const attributes: SequelizeAttributes<transaction.TransactionAttributes> = {
    id: {
        type: Sequalize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    coin: {
        type: Sequalize.STRING,
    },
    txid: {
        type: Sequalize.STRING,
    },
    amount: {
        type: Sequalize.DOUBLE,
        allowNull: true,
    },
};

export const TransactionModel = db.define<transaction.TransactionInstance, transaction.TransactionAttributes>(
    'transactions',
    attributes,
    { underscored: true },
);
