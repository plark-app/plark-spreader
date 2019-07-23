import express from 'express';
import { groupBy, forEach } from 'lodash';
import { UserProvider } from 'common/providers';
import { AddressModel, PlatformModel } from 'models';

export default async function getStatus(req: express.Request, res: express.Response, _next: AnyFunc) {
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
                    coin: coin,
                    ...platformInfo,
                    addrs: addrs.map((addr: AddressInstance) => addr.address),
                });
            },
        );
    });

    res.status(200).send({
        data: responseData,
    });
}
