import Sequelize from 'sequelize';
import config from 'config';

const dbConfig = config.get<DatabaseConfigUnit>('database');

if (!dbConfig) {
    throw new Error('Need configurate DB connection');
}

export const db = new Sequelize({
    database: dbConfig.database,
    username: dbConfig.username,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    logging: false,
});
