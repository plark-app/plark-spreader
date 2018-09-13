import express from 'express';
import Sequelize from 'sequelize';
import { forEach } from 'lodash';
import { config } from 'config';
import { db } from 'common/database';
import { apiRouter } from 'routes';
import { modelList } from 'models';



const expressApp = express();
expressApp.set('port', config.get('app.port', 5005));
expressApp.set('hostname', config.get('app.host', 'localhost'));

expressApp.use('/api', apiRouter);

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

    expressApp.listen(expressApp.get('port'), () => {
        console.log(`Server is listening on port: ${expressApp.get('port')}`);

        console.log(
            '  App is running at http://%s:%d in %s mode',
            expressApp.get('hostname'),
            expressApp.get('port'),
            expressApp.get('env'),
        );
    });
}

startApplication().catch((error) => {
    console.error(error.message);
    console.log();
});
