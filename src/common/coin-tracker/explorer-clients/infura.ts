import Axios, { AxiosInstance } from 'axios';
import { map } from 'lodash';
import { Coin, Utils } from '@plark/wallet-core';
import config from 'config';

export class NotFoundBlock extends Error {
    public blockNumber: Infura.BlockNumber;

    public constructor(blockNumber: Infura.BlockNumber) {
        super(`Block not found [${blockNumber}]`);

        this.blockNumber = blockNumber;
    }
}

export class InfuraClient {
    protected coin: Coin.Unit;
    protected trackerParams: tracker.TrackerParams;
    protected axios: AxiosInstance;

    public constructor(coin: Coin.Unit) {
        this.coin = coin;
        this.trackerParams = config.get(`tracker.${this.coin}`) as tracker.TrackerParams;

        if (!this.trackerParams) {
            throw new Error('Fuck!');
        }

        this.axios = Axios.create({
            baseURL: this.trackerParams.apiUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }


    public getTrackerParams(): tracker.TrackerParams {
        return this.trackerParams;
    }


    protected async sendRequest(method: string, params?: any[]): Promise<Infura.JsonRPCResponse> {
        if (params) {
            params = map(params, (elem) => {
                if (Number.isInteger(elem)) {
                    return Utils.numberToHex(elem);
                }

                if (Buffer.isBuffer(elem)) {
                    return Utils.addHexPrefix((elem as Buffer).toString('hex'));
                }

                return elem;
            });
        }

        const requestData = {
            jsonrpc: "2.0",
            id: 1,
            method: method,
            params: params,
        };

        const { data } = await this.axios.request({
            method: 'POST',
            data: requestData,
        });

        return data as Infura.JsonRPCResponse;
    }

    public async getBlock(blockNumber: Infura.BlockNumber): Promise<Infura.Block> {
        const response = await this.sendRequest('eth_getBlockByNumber', [blockNumber, true]);

        if (!response.result) {
            throw new NotFoundBlock(blockNumber);
        }

        return response.result;
    }
}
