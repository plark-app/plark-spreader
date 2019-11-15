import { coins } from 'common/coin';
import eventEmitter, { Events } from 'common/events';
import { AddressProvider } from 'common/providers';

const TIMEOUT = 60 * 60 * 24 * 30;

export default async () => {
    await AddressProvider.removeOld(TIMEOUT);

    coins.map((coin: string) => {
        eventEmitter.emit(`${Events.UpdateCoin}:${coin}`);
    });
};
