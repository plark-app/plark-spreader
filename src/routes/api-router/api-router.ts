import express from 'express';
import eventEmitter from 'common/events';
import bodyParser from 'body-parser';
import { createLogger } from './logger';
import { errorHandler } from './error-handler';


import * as Methods from './methods';

export default (): express.Router => {
    const apiRouter = express.Router();

    apiRouter.use(bodyParser.json({ type: 'application/json' }));
    apiRouter.use(createLogger());

    apiRouter.get('/status/:user_token', Methods.get_Status);
    apiRouter.post('/subscribe/:user_token', Methods.post_Subscribe(eventEmitter));
    apiRouter.delete('/unsubscribe/:user_token', Methods.delete_Unsubscribe(eventEmitter));
    apiRouter.delete('/token-unsubscribe', Methods.delete_TokenUnsubscribe(eventEmitter));

    apiRouter.use(errorHandler);

    return apiRouter;
};
