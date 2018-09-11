import express from 'express';
import bodyParser from 'body-parser';
import { createLogger } from './logger';
import { errorHandler } from './error-handler';
import { HttpError } from 'common/http-errors';

// import config from 'config';

export const apiRouter = express.Router();
apiRouter.use(bodyParser.json({ type: 'application/vnd.api+json' }));
apiRouter.use(createLogger());

apiRouter.get('/status/:user_token', async (req: express.Request, res: express.Response, next: any) => {
    const data = {
        success: 'success',
        data: req.body,
        user_token: req.params.user_token,
    };

    if (req) {
        return next(new HttpError());
    }

    res.status(200).send(data);
});

apiRouter.post('/subscribe', async (req: express.Request, res: express.Response) => {
    const data = {
        success: 'success',
        data: req.body,
    };

    res.status(200).send(data);
});

apiRouter.delete('/unsubscribe', async (req: express.Request, res: express.Response) => {
    const data = {
        success: 'success',
        data: req.body,
    };

    res.status(200).send(data);
});

apiRouter.use(errorHandler);
