import express from 'express';
import { groupBy, forEach } from 'lodash';
import bodyParser from 'body-parser';
import { createLogger } from './logger';
import { errorHandler } from './error-handler';

import Validator from 'validatorjs';
import { ValidationError } from 'common/http-errors';
import { UserProvider, PlatformProvider } from 'common/providers';

import { AddressModel, PlatformModel } from 'models';

export const apiRouter = express.Router();
apiRouter.use(bodyParser.json({ type: 'application/json' }));
apiRouter.use(createLogger());


apiRouter.get('/status/:user_token', async (req: express.Request, res: express.Response, _next: AnyFunc) => {
    const user = await UserProvider.getUser(req.params.user_token);
    const platforms = await PlatformModel.findAll({
        where: {
            user_token: user.token,
        },
        include: [{
            model: AddressModel,
            as: 'Addresses',
        }],
    });

    const responseData: any[] = [];

    platforms.forEach((plt: PlatformInstance) => {
        const platformInfo: any = {
            type: plt.type,
            token: plt.token,
            addrs: {},
        };

        if (!plt.Addresses) {
            return;
        }

        forEach(
            groupBy(plt.Addresses, 'coin'),
            (addrs: AddressInstance[], coin: string) => {
                responseData.push({
                    ...platformInfo,
                    coin: coin,
                    addrs: addrs.map((addr: AddressInstance) => addr.address),
                });
            },
        );
    });

    res.status(200).send({
        data: responseData,
    });
});


apiRouter.post('/subscribe/:user_token', async (req: express.Request, res: express.Response, _next: AnyFunc) => {

    let rules = {
        coin: ['required'],
        platform: ['required', 'in:ios,android,chrome'],
        platform_token: ['required', 'min:8'],
        addresses: ['required', 'array'],
    };

    const data = req.body;
    const userToken: string = req.params.user_token;

    const validation = new Validator(req.body, rules);

    if (validation.fails()) {
        return _next(new ValidationError(validation.errors.all()));
    }

    const user = await UserProvider.getUser(userToken);
    const platform = await PlatformProvider.getUserPlatform(user, data.platform, data.platform_token);
    const newAddrs = await PlatformProvider.resolveAddresses(platform, data.coin, data.addresses);

    res.status(200).send({
        subscription: platform,
        addresses: newAddrs,
    });
});


apiRouter.delete('/unsubscribe/:user_token', async (req: express.Request, res: express.Response, _next: AnyFunc) => {

    const data = req.body;
    const userToken: string = req.params.user_token;

    let rules = {
        coin: ['required'],
        platform: ['required', 'in:ios,android,chrome'],
        platform_token: ['required', 'min:8'],
    };

    const validation = new Validator(data, rules);

    if (validation.fails()) {
        return _next(new ValidationError(validation.errors.all()));
    }

    const user = await UserProvider.getUser(userToken);
    const platform = await PlatformProvider.getUserPlatform(user, data.platform, data.platform_token);

    await PlatformProvider.unsubscribeAddresses(platform, data.coin);

    res.status(204).send();
});


apiRouter.use(errorHandler);
