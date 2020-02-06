import express from 'express';
import crypto from 'crypto';
import config from 'config';
import { fetchBody } from 'common/helper';
import { HttpError } from 'common/http-errors';

export default async function postIntercomSign(req: express.Request, res: express.Response, _next: AnyFunc) {

    const data = fetchBody(req);
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
