import BitcoinJS from 'bitcoinjs-lib';
import SocketClient from 'socket.io-client';
import { Coin } from '@berrywallet/core';
import { InsightClient } from './explorer-clients';
import { AbstractTracker } from './abstract-tracker';

export class BIPCoinTracker extends AbstractTracker {
    protected socket?: SocketIOClient.Socket;
    protected connected: boolean = false;
    protected coinNetwork: BitcoinJS.Network;
    protected client: InsightClient;

    public constructor(coin: Coin.Unit) {
        super(coin);

        this.coinNetwork = (Coin.makeCoin(this.coin) as Coin.BIPGenericCoin).networkInfo();
        this.client = new InsightClient(coin);
    }

    public async start(): Promise<void> {
        await super.start();

        this.socket = await this.createSocketConnection();

        setTimeout(() => this.bindSocketEvents(), 500);

        this.log('Start track', `${this.addresses.length} addrs`);
    }


    protected createSocketConnection = async (): Promise<SocketIOClient.Socket> => {

        const config = this.client.getTrackerParams();

        if (!config.webSocket) {
            throw new Error(`No webSocket URL for ${this.coin}`);
        }

        const socket = SocketClient.connect(config.webSocket, {
            timeout: 5000,
            autoConnect: false,
            rejectUnauthorized: true,
            transports: ['websocket'],
        });

        const promise = new Promise<SocketIOClient.Socket>((resolve, reject) => {
            socket.on('connect', () => {
                resolve(socket);
            });

            socket.on('error', (error: Error) => {
                this.log('Error', error);
                reject(new Error(`[${this.coin}] Some Error`));
            });

            socket.on('connect_timeout', (error: Error) => {
                this.log('Timeout', error);
                reject(new Error(`[${this.coin}] Connection timeout`));
            });
        });

        socket.open();

        return await promise;
    };

    protected bindSocketEvents = (): void => {
        if (!this.socket) {
            return;
        }

        this.socket.emit('subscribe', 'inv');

        this.socket.on('block', this.onHandleBlock);
        this.socket.on('tx', this.onHandleTransaction);
    };

    protected onHandleBlock = async (blockHash: string) => {
        const block = await this.client.getBlock(blockHash);

        block.transactions.forEach((_tx: BitcoinJS.Transaction) => {

        });
    };

    protected onHandleTransaction = async (tx: Insight.InsightEventTransaction) => {
        const handledAddresses: string[] = [];

        this.getAddresses(tx).forEach((address: string) => {
            if (this.addresses.indexOf(address) >= 0) {
                handledAddresses.push(address);
            }
        });

        if (handledAddresses.length > 0) {
            this.emitTransactionListener(tx.txid, handledAddresses);
        }
    };

    protected getAddresses(tx: Insight.InsightEventTransaction): string[] {
        return tx.vout.map((obj: any) => Object.keys(obj)[0]);
    }
}
