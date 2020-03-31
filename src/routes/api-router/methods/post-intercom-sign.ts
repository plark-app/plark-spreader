import express from 'express';
import crypto from 'crypto';
import Validator from 'validatorjs';
import config from 'config';
import { fetchBody } from 'common/helper';
import { HttpError, ValidationError } from 'common/http-errors';

export default async function postIntercomSign(req: express.Request, res: express.Response, _next: AnyFunc) {

    const data = fetchBody(req);

    let rules = {
        seed_id: ['required'],
    };

    const validation = new Validator(data, rules);
    if (validation.fails()) {
        return _next(new ValidationError(validation.errors.all()));
    }

    const { seed_id, platform = 'ios' } = data;

    const key = config.get<string>(`intercom.secrets.${platform}`);
    if (!key || key.length < 1) {
        return _next(new HttpError(`Platform ${platform} is not configured.`, 400));
    }

    const userHash = crypto.createHmac('sha256', key).update(seed_id).digest('hex');

    res.status(200).send({
        data: {
            user_hash: userHash,
        },
    });
}
