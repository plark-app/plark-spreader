import express from 'express';
import bodyParser from 'body-parser';
import { createLogger } from './logger';
import { errorHandler } from './error-handler';

import Validator from 'validatorjs';
import { ValidationError } from 'common/http-errors';
import { UserModel, PlatformModel, AddressModel } from 'models';
// import config from 'config';

export const apiRouter = express.Router();
apiRouter.use(bodyParser.json({ type: 'application/json' }));
apiRouter.use(createLogger());


const getUser = async (userToken: string): Promise<UserInstance> => {
    const [user] = await UserModel.findOrCreate({
        where: {
            token: userToken,
        },
    });

    return user;
};

const getAddress = async (coin: any, addr: string): Promise<AddressInstance> => {
    const [addressInstance] = await AddressModel.findOrCreate({
        where: {
            coin: coin,
            address: addr,
        },
    });

    return addressInstance;
};

const getUserPlatform = async (user: UserInstance, type: Platform, token: string): Promise<PlatformInstance> => {
    let [platform] = await user.getPlatforms({
        where: {
            type: type,
            token: token,
        },
    });

    if (platform) {
        return platform;
    }

    return await PlatformModel.create({
        user_token: user.get('token'),
        type: type,
        token: token,
    });
};

apiRouter.get('/status/:user_token', async (req: express.Request, res: express.Response, _next: AnyFunc) => {
    const user = await getUser(req.params.user_token);

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

    const user = await getUser(req.params.user_token);
    const platform = await getUserPlatform(user, req.body.platform, req.body.platform_token);

    const addresses = await Promise.all<AddressInstance>(req.body.addresses.map((addr: string) => getAddress(req.body.coin, addr)));
    const result = await platform.setAddresses(addresses);

    const response = {
        success: 'success',
        data: platform,
        addresses: result,
        user_token: req.params.user_token,
    };

    res.status(200).send(response);
});

apiRouter.delete('/unsubscribe/:user_token', async (req: express.Request, res: express.Response) => {
    const data = {
        success: 'success',
        data: req.body,
        user_token: req.params.user_token,
    };

    res.status(200).send(data);
});

apiRouter.use(errorHandler);
