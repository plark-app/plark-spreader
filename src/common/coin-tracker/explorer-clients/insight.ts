import Axios from 'axios';
import BitcoinJS from 'bitcoinjs-lib';
import { Coin, Networking } from '@plark/wallet-core';
import config from 'config';
import { wait } from 'common/helper';
import logger from 'common/logger';

const ATTEMPT_LIMIT = 5;
const ATTEMPT_TIMEOUT = 5000;

export class InsightClient {
    protected coin: Coin.Unit;
    protected trackerParams: tracker.TrackerParams;


    public constructor(coin: Coin.Unit) {
        this.coin = coin;
        this.trackerParams = config.get(`tracker.${this.coin}`) as tracker.TrackerParams;

        if (!this.trackerParams) {
            logger.warning('Fuck!');
        }
    }


    public getTrackerParams(): tracker.TrackerParams {
        return this.trackerParams;
    }


    public async fetchBlock(blockHash: string, attempt: number = 0): Promise<BitcoinJS.Block> {
        try {
            const { data } = await Axios.get(`/rawblock/${blockHash}`, {
                baseURL: this.trackerParams.apiUrl,
            });

            return BitcoinJS.Block.fromHex(data.rawblock);
        } catch (error) {
            if (attempt >= ATTEMPT_LIMIT) {
                throw new Error(`Not found block ${blockHash} of ${this.coin}`);
            }

            await wait(ATTEMPT_TIMEOUT);

            return this.fetchBlock(blockHash, attempt + 1);
        }
    }


    public async fetchApiBlock(blockHash: string, attempt: number = 0): Promise<Networking.Api.Insight.Block> {
        try {
            const { data } = await Axios.get(`/block/${blockHash}`, {
                baseURL: this.trackerParams.apiUrl,
            });

            return data;
        } catch (error) {
            if (attempt >= ATTEMPT_LIMIT) {
                throw new Error(`Not found block ${blockHash} of ${this.coin}`);
            }

            await wait(ATTEMPT_TIMEOUT);

            return this.fetchApiBlock(blockHash, attempt + 1);
        }
    }

    /**
     * @param {string} txid
     * @param {number} attempt
     *
     * @return {Promise<Networking.Api.Insight.Transaction>>}
     */
    public async fetchTransaction(txid: string, attempt: number = 0): Promise<Networking.Api.Insight.Transaction> {
        try {
            const { data } = await Axios.get(`/tx/${txid}`, {
                baseURL: this.trackerParams.apiUrl,
            });

            return data;
        } catch (error) {
            if (attempt >= ATTEMPT_LIMIT) {
                throw new Error(`Not found transaction by ${txid} of ${this.coin}`);
            }

            await wait(ATTEMPT_TIMEOUT);

            return this.fetchTransaction(txid, attempt + 1);
        }
    }
}
