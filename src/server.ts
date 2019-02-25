import express from 'express';
import Sequelize from 'sequelize';
import { forEach } from 'lodash';

import { coins } from 'common/coin';
import { config } from 'config';
import { createApiRouter } from 'routes';
import { modelList } from 'models';
import { db } from 'common/database';
import { ConsoleColor } from 'common/console';
import { configureFirebase, PlarkNotifier } from 'common/firebase';
import { startTransactionTracking } from 'common/coin-tracker';
import { startSheduleModule } from 'schedule';

const expressApp = express();
expressApp.set('port', config.get('app.port', 5005));
expressApp.set('hostname', config.get('app.host', 'localhost'));

expressApp.use('/api', createApiRouter());

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

    const admin = configureFirebase();
    new PlarkNotifier(admin);

    await startTransactionTracking(coins);
    await startSheduleModule();

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
