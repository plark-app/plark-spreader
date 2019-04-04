import express from 'express';
import bodyParser from 'body-parser';
import { Coin } from '@plark/wallet-core';
import { coins } from 'common/coin';
import EventEmmiter, { Events } from 'common/events';
import { CoinTrackerPool } from 'common/coin-tracker';
import { createLogger } from './logger';
import { BlockProvider } from 'common/providers';
import logger from 'common/logger';

const trackerStatus = {} as any;

coins.forEach((coin) => {
    trackerStatus[coin] = {
        connected: false,
        disconnectTime: undefined,
        block: undefined,
        addressCount: 0,
    };
});


EventEmmiter.on(Events.NewBlock, (data: any) => {
    const { block, coin, blockData } = data;
    trackerStatus[coin].block = {
        time: new Date().toLocaleString(),
        hash: typeof block.getId === 'function' ? block.getId() : block.hash,
    };

    if (blockData) {
        BlockProvider
            .newBlock(coin, blockData)
            .then(() => {
                logger.info(`[${coin}] Stored new block ${blockData.hash}`);
            });
    }
});


EventEmmiter.on(Events.TrackerConnected, (data: any) => {
    const { coin } = data;
    trackerStatus[coin].connected = true;
    trackerStatus[coin].disconnectTime = undefined;
});


EventEmmiter.on(Events.TrackerDisconnected, (data: any) => {
    const { coin } = data;

    trackerStatus[coin].connected = false;
    trackerStatus[coin].disconnectTime = new Date().toLocaleString();
});


export default (): express.Router => {
    const apiRouter = express.Router();

    apiRouter.use(bodyParser.json({ type: 'application/json' }));
    apiRouter.use(createLogger());

    apiRouter.get('/', async (_req: express.Request, res: express.Response) => {
        const promises = coins.map(async (coin: Coin.Unit) => {
            const addresses = await CoinTrackerPool.getAddresses(coin);
            trackerStatus[coin].addressCount = addresses.length;
        });

        await Promise.all(promises);

        res.send({
            trackerStatus: trackerStatus,
        });
    });

    return apiRouter;
};
