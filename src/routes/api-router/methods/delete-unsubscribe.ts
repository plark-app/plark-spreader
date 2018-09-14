import express from 'express';

import Validator from 'validatorjs';
import { ValidationError } from 'common/http-errors';
import { UserProvider, PlatformProvider } from 'common/providers';
import { EventEmitter } from 'events';

export const deleteUnsubscribe = (eventEmitter: EventEmitter) => {
    return async (req: express.Request, res: express.Response, _next: AnyFunc) => {

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

        eventEmitter.emit(`update-coin:${data.coin}`);
    };
};