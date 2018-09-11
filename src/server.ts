import express from 'express';

import { config } from 'config';
import { apiRouter } from 'routes';

const expressApp = express();
expressApp.set('port', config.get('app.port', 5005));
expressApp.set('hostname', config.get('app.host', 'localhost'));

expressApp.use('/api', apiRouter);

expressApp.listen(expressApp.get('port'), () => {
    console.log(`Server is listening on port: ${expressApp.get('port')}`);

    console.log(
        '  App is running at http://%s:%d in %s mode',
        expressApp.get('hostname'),
        expressApp.get('port'),
        expressApp.get('env'),
    );
});