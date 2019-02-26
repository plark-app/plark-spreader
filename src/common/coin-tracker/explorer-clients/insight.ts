import BitcoinJS from 'bitcoinjs-lib';
import Axios from 'axios';
import config from 'config';
import { Coin } from '@plark/wallet-core';

export class InsightClient {
    protected coin: Coin.Unit;
    protected trackerParams: Tracker.TrackerParams;

    public constructor(coin: Coin.Unit) {
        this.coin = coin;
        this.trackerParams = config.get(`tracker.${this.coin}`) as Tracker.TrackerParams;

        if (!this.trackerParams) {
            throw new Error('Fuck!');
        }
    }

    public getTrackerParams(): Tracker.TrackerParams {
        return this.trackerParams;
    }

    public async getBlock(blockHash: string): Promise<BitcoinJS.Block> {
        try {
            const { data } = await Axios.get(`/rawblock/${blockHash}`, {
                baseURL: this.trackerParams.apiUrl,
            });

            return BitcoinJS.Block.fromHex(data.rawblock);
        } catch (error) {
            throw new Error(`Not found block ${blockHash} of ${this.coin}`);
        }
    }
}
