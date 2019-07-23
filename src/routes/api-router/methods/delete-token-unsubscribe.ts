import express from 'express';

import Validator from 'validatorjs';
import { EventEmitter } from 'events';
import { ValidationError } from 'common/http-errors';
import { PlatformProvider } from 'common/providers';
import { coins } from 'common/coin';
import { Events } from 'common/events';

export default function delete_TokenUnsubscribe(eventEmitter: EventEmitter) {
    return async (req: express.Request, res: express.Response, _next: AnyFunc) => {

        const data = req.body;

        let rules = {
            platform_token: ['required', 'min:8'],
        };

        const validation = new Validator(data, rules);

        if (validation.fails()) {
            return _next(new ValidationError(validation.errors.all()));
        }

        const platform = await PlatformProvider.findPlatform(data.platform_token);

        if (!platform) {
            res.status(204).send();

            return;
        }

        await PlatformProvider.unsubscribeAddresses(platform);

        res.status(204).send();

        coins.map((coin: string) => {
            eventEmitter.emit(`${Events.UpdateCoin}:${coin}`);
        });
    };
}
