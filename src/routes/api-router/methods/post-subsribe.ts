import express from 'express';
import { uniq } from 'lodash';
import { EventEmitter } from 'events';
import Validator from 'validatorjs';

import { ValidationError } from 'common/http-errors';
import { UserProvider, PlatformProvider } from 'common/providers';
import { Events } from 'common/events';


export const postSubscribe = (eventEmitter: EventEmitter) => {
    return async (req: express.Request, res: express.Response, _next: AnyFunc) => {

        let rules = {
            coin: ['required'],
            platform: ['required', 'in:ios,android,chrome'],
            platform_token: ['required', 'min:8'],
            addresses: ['required', 'array', 'max:100'],
        };

        const data = req.body;
        const userToken: string = req.params.user_token;

        const validation = new Validator(req.body, rules);

        if (validation.fails()) {
            return _next(new ValidationError(validation.errors.all()));
        }

        const addrs: string[] = uniq(data.addresses);

        try {
            const user = await UserProvider.getUser(userToken);
            const platform = await PlatformProvider.resolveUserPlatform(user, data.platform_token, data.platform);
            const newAddrs = await PlatformProvider.resolveAddresses(platform, data.coin, addrs);

            res.status(200).send({
                subscription: platform,
                addresses: newAddrs,
            });

            eventEmitter.emit(`${Events.UpdateCoin}:${data.coin}`);
        } catch (error) {
            return _next(error);
        }
    };
};
