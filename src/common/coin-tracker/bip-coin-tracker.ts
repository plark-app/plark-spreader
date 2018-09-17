import BitcoinJS from 'bitcoinjs-lib';
import SocketClient from 'socket.io-client';
import { Coin } from '@berrywallet/core';
import { AbstractTracker } from './abstract-tracker';

const availableTypes = [
    "pubkeyhash",
    "scripthash",
    "multisig",
    "pubkey",
    "witnesspubkeyhash",
    "witnessscripthash",
];

export class BIPCoinTracker extends AbstractTracker {
    protected socket?: SocketIOClient.Socket;
    protected connected: boolean = false;
    protected coinNetwork: BitcoinJS.Network;

    public constructor(coin: Coin.Unit) {
        super(coin);
        this.coinNetwork = (Coin.makeCoin(this.coin) as Coin.BIPGenericCoin).networkInfo();
    }

    public async start(): Promise<void> {
        await super.start();

        this.socket = await this.createSocketConnection();
        this.bindSocketEvents();

        console.log(`[${this.coin}]`, `Start track ${this.addresses.length} addrs`);
    }


    protected createSocketConnection = async (): Promise<SocketIOClient.Socket> => {

        const config = this.getTrackerConfig();

        if (!config || !config.webSocket) {
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
                console.log(`[${this.coin}] Error`, error);
                reject(new Error(`[${this.coin}] Some Error`));
            });

            socket.on('connect_timeout', (error: Error) => {
                console.log(`[${this.coin}] Timeout`, error);
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

        this.socket.emit('subscribe', 'bitcoind/rawtransaction');
        this.socket.emit('subscribe', 'bitcoind/hashblock');

        this.socket.on('bitcoind/rawtransaction', this.onHandleRawTransaction);
        this.socket.on('bitcoind/hashblock', this.onHandleRawBlock);

        //this.socket.emit('subscribe', 'inv');

        //this.socket.on('block', this.onHandleBlock);
        //this.socket.on('tx', this.onHandleTransaction);
    };


    protected onHandleBlock = async (blockHash: string) => {
        console.log(`[${this.coin}]`, 'New block');
        console.log(blockHash);
        console.log();
    };

    protected onHandleTransaction = async (tx: any) => {
        console.log(`[${this.coin}]`, 'New transaction');
        console.log(tx.vout.map((obj: any) => Object.keys(obj)[0]).join(', '));
        console.log();
    };

    protected onHandleRawBlock = async (data: any) => {
        console.log(`[${this.coin}]`, 'New raw block');
        console.log(data);
        console.log();
    };

    protected onHandleRawTransaction = async (data: any) => {
        console.log(`[${this.coin}]`, 'New raw transaction');
        const transaction = BitcoinJS.Transaction.fromHex(data);

        console.log('TXID', transaction.getId());

        transaction.outs.forEach((out: BitcoinJS.Out) => {
            const addr = this.getOutAddress(out);

            console.log(addr.type, addr.address || '--');
        });

        console.log();
    };

    protected getOutAddress(out: BitcoinJS.Out): { type: BitcoinJS.script.OutputScript, address?: string } {
        const type = BitcoinJS.script.classifyOutput(out.script);
        let address: string | undefined;

        if (availableTypes.indexOf(type) >= 0) {
            address = BitcoinJS.address.fromOutputScript(out.script, this.coinNetwork);
        }

        return { type, address };
    }
}
