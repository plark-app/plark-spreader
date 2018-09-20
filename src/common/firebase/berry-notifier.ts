import { EventEmitter } from 'events';
import { Coin } from '@berrywallet/core';
import { app } from 'firebase-admin';

import { PlatformProvider } from 'common/providers';
import { TransactionInfo } from 'common/coin-tracker/types';
import { Events } from 'common/events';


export class BerryNotifier {

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

        const platforms = await PlatformProvider.getPlatformsOfAddresses(coin, addresses);

        console.log(platforms.map((platform: PlatformInstance) => platform.token));
    };
}
