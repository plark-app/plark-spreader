import express from 'express';
import eventEmitter from 'common/events';
import bodyParser from 'body-parser';
import { createLogger } from './logger';
import { errorHandler } from './error-handler';


import * as Methods from './methods';

export const createApiRouter = (): express.Router => {
    const apiRouter = express.Router();

    apiRouter.use(bodyParser.json({ type: 'application/json' }));
    apiRouter.use(createLogger());

    apiRouter.get('/status/:user_token', Methods.getStatus);
    apiRouter.post('/subscribe/:user_token', Methods.postSubscribe(eventEmitter));
    apiRouter.delete('/unsubscribe/:user_token', Methods.deleteUnsubscribe(eventEmitter));

    apiRouter.use(errorHandler);

    return apiRouter;
};
