import express from 'express';
import Sequelize from 'sequelize';
import { forEach } from 'lodash';

import EventEmitter from 'events';
import { coins } from 'common/coin';
import { config } from 'config';
import { createApiRouter } from 'routes';
import { modelList } from 'models';
import { db } from 'common/database';
import { ConsoleColor } from 'common/console';

import { startTransactionTracking } from 'common/coin-tracker';

const expressApp = express();
expressApp.set('port', config.get('app.port', 5005));
expressApp.set('hostname', config.get('app.host', 'localhost'));

const eventEmitter = new EventEmitter();

expressApp.use('/api', createApiRouter(eventEmitter));

async function startApplication() {
    try {
        await db.sync();
    } catch (error) {
        console.error('Cannot connect to database: ');

        throw error;
    }

    forEach(modelList, (model: Sequelize.Model<any, any>) => {
        if (model.associate) {
            model.associate(modelList);
        }
    });

    await startTransactionTracking(coins, eventEmitter);

    expressApp.listen(expressApp.get('port'), () => {
        console.log(`${ConsoleColor.FgYellow}Server is listening on port: ${expressApp.get('port')}`, ConsoleColor.Reset);

        console.log(
            '%sApp is running at http://%s:%d in %s mode %s',
            ConsoleColor.FgGreen,
            expressApp.get('hostname'),
            expressApp.get('port'),
            expressApp.get('env'),
            ConsoleColor.Reset,
        );
        console.log();
    });
}

startApplication().catch((error) => {
    console.error(error.message);
    console.log();
});
