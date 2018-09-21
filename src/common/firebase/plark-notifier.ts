import { EventEmitter } from 'events';
import { app, messaging } from 'firebase-admin';
import { Coin } from '@berrywallet/core';

import { TransactionInfo } from 'common/coin-tracker/types';
import { Events } from 'common/events';
import { MessageBuilder } from './message-builder';


export class PlarkNotifier {
    protected firebaseApp: app.App;
    protected eventEmitter: EventEmitter;


    public constructor(firebaseApp: app.App, eventEmitter: EventEmitter) {
        this.firebaseApp = firebaseApp;
        this.eventEmitter = eventEmitter;

        this.eventEmitter.on(Events.HandleTX, this.handleTransaction);
    }


    protected handleTransaction = async (coin: Coin.Unit, addresses: string[], txInfo: TransactionInfo): Promise<void> => {
        console.log(' ------------------------------------------------------------------ ');
        console.log(` [${coin}] Transaction`);
        console.log(addresses);
        console.log(txInfo.txid);
        console.log(txInfo);
        console.log(' ------------------------------------------------------------------ ');

        const builder = new MessageBuilder(coin, addresses, txInfo);

        const tokens = await builder.getTokens();
        if (!tokens) {
            return;
        }

        const message = builder.buildMessage();

        const response: messaging.MessagingDevicesResponse
            = await this.firebaseApp.messaging().sendToDevice(tokens, message);

        response.results.map((res: messaging.MessagingDeviceResult) => {
            console.log(res.canonicalRegistrationToken, res.error ? 'error' : 'success');
        });
    };
}
