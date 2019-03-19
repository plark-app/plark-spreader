import express from 'express';
import bodyParser from 'body-parser';
import { Coin } from '@plark/wallet-core';
import { coins } from 'common/coin';
import EventEmmiter from 'common/events';
import { CoinTrackerPool } from 'common/coin-tracker';
import { createLogger } from './logger';

const lastBlockList = {} as any;
EventEmmiter.on('new-block', (data: any) => {
    const { block, coin } = data;
    lastBlockList[coin] = {
        time: new Date().toISOString(),
        blockHeight: typeof block.getId === 'function' ? block.getId() : block.hash,
    };
});

export default (): express.Router => {
    const apiRouter = express.Router();

    apiRouter.use(bodyParser.json({ type: 'application/json' }));
    apiRouter.use(createLogger());

    apiRouter.get('/', async (_req: express.Request, res: express.Response) => {
        const promises = coins.map(async (coin: Coin.Unit) => {
            const addresses = await CoinTrackerPool.getAddresses(coin);

            return {
                coin: coin,
                addressCount: addresses.length,
            };
        });

        const result = await Promise.all(promises);

        res.send({
            coins: result,
            lastBlocks: lastBlockList,
        });
    });

    return apiRouter;
};
