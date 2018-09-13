import express from 'express';
import bodyParser from 'body-parser';
import { createLogger } from './logger';
import { errorHandler } from './error-handler';

import Validator from 'validatorjs';
import { ValidationError } from 'common/http-errors';
import { UserProvider, PlatformProvider } from 'common/providers';

export const apiRouter = express.Router();
apiRouter.use(bodyParser.json({ type: 'application/json' }));
apiRouter.use(createLogger());


apiRouter.get('/status/:user_token', async (req: express.Request, res: express.Response, _next: AnyFunc) => {
    const user = await UserProvider.getUser(req.params.user_token);

    res.status(200).send({
        data: user,
        platforms: await user.getPlatforms(),
    });
});


apiRouter.post('/subscribe/:user_token', async (req: express.Request, res: express.Response, _next: AnyFunc) => {

    let rules = {
        coin: ['required'],
        platform: ['required', 'in:ios,android,chrome'],
        platform_token: ['required', 'min:8'],
        addresses: ['required', 'array'],
    };

    const validation = new Validator(req.body, rules);

    if (validation.fails()) {
        return _next(new ValidationError(validation.errors.all()));
    }

    const user = await UserProvider.getUser(req.params.user_token);
    const platform = await PlatformProvider.getUserPlatform(user, req.body.platform, req.body.platform_token);
    const newAddrs = await PlatformProvider.resolveAddresses(platform, req.body.coin, req.body.addresses);

    res.status(200).send({
        subscription: platform,
        addresses: newAddrs,
    });
});

apiRouter.delete('/unsubscribe/:user_token', async (req: express.Request, res: express.Response) => {
    const data = {
        subscription: req.body,
        user_token: req.params.user_token,
    };

    res.status(200).send(data);
});

apiRouter.use(errorHandler);
