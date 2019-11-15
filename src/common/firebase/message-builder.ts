import { messaging } from 'firebase-admin';
import { Coin, makeCoin } from '@plark/wallet-core';
import { TransactionInfo } from 'common/coin-tracker/types';
import { PlatformProvider } from 'common/providers';

export class MessageBuilder {
    protected coin: Coin.CoinInterface;
    protected addresses: string[];
    protected txInfo: TransactionInfo;

    public constructor(coin: Coin.Unit, addresses: string[], txInfo: TransactionInfo) {
        this.coin = makeCoin(coin);
        this.addresses = addresses;
        this.txInfo = txInfo;
    }

    public buildMessage(): messaging.MessagingPayload {
        return {
            notification: {
                title: `Incoming ${this.coin.getUnit()} Transaction`,
                body: `Hey! Some coins rolled in 👛`,
            },
            data: {
                type: 'transaction',
                status: 'new',
                coin: this.coin.getUnit() as string,
                txid: this.txInfo.txid,
                addresses: JSON.stringify(this.addresses),
                tx: JSON.stringify(this.txInfo),
                amount: '0',
            },
        };
    }

    public async getTokens(): Promise<string[]> {
        const platforms = await PlatformProvider.getPlatformsOfAddresses(this.coin.getUnit(), this.addresses);

        return platforms.map((platform: PlatformInstance) => platform.token);
    }
}
