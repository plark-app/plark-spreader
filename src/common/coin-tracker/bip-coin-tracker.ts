import BitcoinJS from 'bitcoinjs-lib';
import SocketClient from 'socket.io-client';
import BigNumber from 'bignumber.js';
import { Coin, Constants } from '@plark/wallet-core';
import logger from 'common/logger';
import { wait } from 'common/helper';
import { TransactionProvider } from 'common/providers';
import EventEmmiter, { Events } from 'common/events';
import { InsightClient } from './explorer-clients';
import { AbstractTracker } from './abstract-tracker';

export class BIPCoinTracker extends AbstractTracker {
    protected socket: SocketIOClient.Socket;
    protected connected: boolean = false;
    protected coinNetwork: BitcoinJS.Network;
    protected client: InsightClient;

    public constructor(coin: Coin.Unit) {
        super(coin);

        this.coinNetwork = (Coin.makeCoin(this.coin) as Coin.BIPGenericCoin).networkInfo();
        this.client = new InsightClient(coin);

        const config = this.client.getTrackerParams();

        if (!config.webSocket) {
            throw new Error(`No webSocket URL for ${this.coin}`);
        }

        this.socket = SocketClient.connect(config.webSocket, {
            timeout: 5000,
            autoConnect: false,
            rejectUnauthorized: true,
            transports: ['websocket'],
        });
    }

    public async start(): Promise<void> {
        await super.start();
        await this.openSocketConnection();

        this.log('Start track', `${this.addresses.length} addrs`);
    }


    protected openSocketConnection = async (): Promise<void> => {
        const promise = new Promise<void>((resolve, reject) => {
            this.socket.once('connect', () => {
                resolve();

                EventEmmiter.emit(Events.TrackerConnected, { coin: this.getCoin() });

                setTimeout(() => this.bindSocketEvents(), 500);
            });

            this.socket.once('error', (error: Error) => {
                this.log('Error', error);
                reject(new Error(`[${this.coin}] Some Error`));

                this.reconnect();
            });

            this.socket.once('connect_error', (error: Error) => {
                this.log('Error', error);
                reject(new Error(`[${this.coin}] Connect Error`));

                this.reconnect();
            });

            this.socket.once('connect_timeout', (error: Error) => {
                this.log('Timeout', error);
                reject(new Error(`[${this.coin}] Connection timeout`));

                this.reconnect();
            });


            this.socket.once('disconnect', () => {
                EventEmmiter.emit(Events.TrackerDisconnected, { coin: this.getCoin() });

                this.reconnect();
            });
        });

        this.socket.open();

        return await promise;
    };


    protected async reconnect() {
        this.socket.removeAllListeners();
        this.socket.close();

        await wait(5000);

        await this.openSocketConnection();
    }


    protected bindSocketEvents = (): void => {
        if (!this.socket) {
            return;
        }

        this.socket.emit('subscribe', 'inv');

        this.socket.on('block', this.onHandleBlock);
        this.socket.on('tx', this.onHandleTransaction);
    };


    protected onHandleBlock = async (blockHash: string) => {
        try {
            const block = await this.client.getBlock(blockHash);
            const apiBlock = await this.client.getApiBlock(blockHash);

            EventEmmiter.emit(Events.NewBlock, {
                block: block,
                blockData: {
                    hash: apiBlock.hash,
                    height: apiBlock.height,
                    blocktime: apiBlock.time,
                },
                coin: this.getCoin(),
            });

            block.transactions.forEach((_tx: BitcoinJS.Transaction) => {
            });
        } catch (error) {
            logger.warn(`[${this.getCoin()}] Not found block ${blockHash}`);
        }
    };


    protected onHandleTransaction = async (tx: Insight.InsightEventTransaction) => {
        const handledAddresses: string[] = [];
        let estimatedAmount = new BigNumber(0);

        this.getAddresses(tx).forEach((data: { addr: string; amount: number; }) => {
            if (this.addresses.indexOf(data.addr) >= 0) {
                handledAddresses.push(data.addr);
                estimatedAmount = estimatedAmount.plus(data.amount);
            }
        });

        if (handledAddresses.length > 0) {
            this.emitTransactionListener(tx.txid, handledAddresses);
            TransactionProvider.newTransaction(
                this.coin,
                tx.txid,
                estimatedAmount.div(Constants.SATOSHI_PER_COIN).toNumber(),
            );
        }
    };


    protected getAddresses(tx: Insight.InsightEventTransaction): Array<{ addr: string; amount: number; }> {
        return tx.vout.map((obj: any) => {
            const addr = Object.keys(obj)[0];

            return { addr: addr, amount: obj[addr] || 0 };
        });
    }
}
