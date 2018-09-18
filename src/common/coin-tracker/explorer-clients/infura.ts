import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { map } from 'lodash';
import { Coin, Utils } from '@berrywallet/core';
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
    protected trackerParams: Tracker.TrackerParams;
    protected axios: AxiosInstance;

    public constructor(coin: Coin.Unit) {
        this.coin = coin;
        this.trackerParams = config.get(`tracker.${this.coin}`) as Tracker.TrackerParams;

        if (!this.trackerParams) {
            throw new Error('Fuck!');
        }

        this.axios = Axios.create({
            baseURL: this.trackerParams.apiUrl,
            timeout: 10000,
        });
    }

    public getTrackerParams(): Tracker.TrackerParams {
        return this.trackerParams;
    }

    protected async sendRequest(method: string, params?: any[], isPost: boolean = false): Promise<Infura.JsonRPCResponse> {
        if (params) {
            params = map(params, (elem) => {
                if (Number.isInteger(elem)) {
                    return Utils.numberToHex(elem);
                }

                if (elem instanceof Buffer) {
                    return Utils.addHexPrefix(elem.toString('hex'));
                }

                return elem;
            });
        }

        const requestConfig = {} as AxiosRequestConfig;
        if (isPost) {
            requestConfig.method = 'POST';
            requestConfig.headers = {
                'Content-Type': 'application/json',
            };

            requestConfig.data = {
                id: 1,
                jsonrpc: '2.0',
                method: method,
                params: params,
            };
        } else {
            requestConfig.url = `/${method}`;
            requestConfig.method = 'GET';
            requestConfig.params = {
                params: JSON.stringify(params),
            };
        }

        const { data } = await this.axios.request(requestConfig);

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
