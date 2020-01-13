import { app, messaging } from 'firebase-admin';
import { Coin } from '@plark/wallet-core';
import logger from 'common/logger';
import { TransactionInfo } from 'common/coin-tracker/types';
import eventEmitter, { Events } from 'common/events';
import { MessageBuilder } from './message-builder';

export class PlarkNotifier {
    protected firebaseApp: app.App;

    public constructor(firebaseApp: app.App) {
        this.firebaseApp = firebaseApp;

        eventEmitter.on(Events.HandleTX, this.handleTransaction);
    }

    protected handleTransaction = async (coin: Coin.Unit, addresses: string[], txInfo: TransactionInfo): Promise<void> => {
        logger.info([
            `[${coin}] Transaction`,
            addresses.join(', '),
            txInfo.txid,
        ].join(' / '));

        const builder = new MessageBuilder(coin, addresses, txInfo);

        const tokens = await builder.getTokens();
        if (!tokens) {
            return;
        }

        const message = builder.buildMessage();

        const response: messaging.MessagingDevicesResponse
            = await this.firebaseApp.messaging().sendToDevice(tokens, message);

        response.results.map((res: messaging.MessagingDeviceResult) => {
            logger.info([
                res.messageId,
                res.error ? 'ERROR' : 'SUCCESS',
                res.error ? `[${res.error.code}] ${res.error.message}` : '',
            ].join(' / '));
        });
    };
}
