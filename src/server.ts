import express from 'express';
import Sequelize from 'sequelize';
import { forEach } from 'lodash';

import { coins } from 'common/coin';
import { config } from 'config';
import Routes from 'routes';
import { modelList } from 'models';
import { db } from 'common/database';
import { configureFirebase, PlarkNotifier } from 'common/firebase';
import { startTransactionTracking } from 'common/coin-tracker';
import { startSheduleModule } from 'schedule';
import logger from 'common/logger';

const expressApp = express();
expressApp.set('port', config.get('app.port', 5005));
expressApp.set('hostname', config.get('app.host', 'localhost'));

expressApp.get('/', Routes.createHomePage());
expressApp.use('/api', Routes.createApiRouter());
expressApp.use('/status', Routes.createStatusRouter());

async function startApplication() {
    try {
        await db.sync();
    } catch (error) {
        logger.error('Cannot connect to database: ', error);

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
        logger.info(`Server is listening on port: ${expressApp.get('port')}`);
        logger.info(
            `App is running at http://${expressApp.get('hostname')}:${expressApp.get('port')} in ${expressApp.get('env')} mode`,
        );
    });
}

startApplication().catch((error) => {
    logger.error(error.message, error);
});
