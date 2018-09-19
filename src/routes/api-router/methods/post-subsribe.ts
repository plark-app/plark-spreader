import express from 'express';
import Validator from 'validatorjs';
import { ValidationError } from 'common/http-errors';
import { UserProvider, PlatformProvider } from 'common/providers';

import { EventEmitter } from 'events';

export const postSubscribe = (eventEmitter: EventEmitter) => {
    return async (req: express.Request, res: express.Response, _next: AnyFunc) => {

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
        const platform = await PlatformProvider.resolveUserPlatform(user, data.platform_token, data.platform);
        const newAddrs = await PlatformProvider.resolveAddresses(platform, data.coin, data.addresses);

        res.status(200).send({
            subscription: platform,
            addresses: newAddrs,
        });

        eventEmitter.emit(`update-coin:${data.coin}`);
    }
};
