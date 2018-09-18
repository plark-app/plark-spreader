import BitcoinJS from 'bitcoinjs-lib';
import { Coin } from '@berrywallet/core';
import { CoinTracker, TransactionHandler, LastItem } from './types';

export abstract class AbstractTracker implements CoinTracker {
    protected coin: Coin.Unit;
    protected isActive: boolean = false;
    protected addresses: string[] = [];
    protected txHandler?: TransactionHandler;

    protected lastTx?: LastItem;
    protected lastBlock?: LastItem;

    protected constructor(coin: Coin.Unit) {
        this.coin = coin;
    }

    public getCoin(): Coin.Unit {
        return this.coin;
    }

    public async start(): Promise<void> {
        if (this.isActive) {
            return;
        }

        this.isActive = true;
    }

    public setAddresses(addresses: string[]): void {
        const oldCount = this.addresses.length;

        this.addresses = addresses;

        if (this.isActive) {
            this.log('Changed addresses list', `(${oldCount} -> ${addresses.length})`);
        }
    }

    public onReceiveTransaction(txHandler: TransactionHandler): void {
        this.txHandler = txHandler;
    }

    public getLastBlock(): LastItem | undefined {
        return this.lastBlock;
    }

    public getLastTransaction(): LastItem | undefined {
        return this.lastTx;
    }

    protected handleNewTransaction = (txid: string, _tx?: Infura.Transaction | BitcoinJS.Transaction): void => {
        // this.log('New transaction', txid);

        this.lastTx = {
            hash: txid,
            time: new Date(),
            index: this.lastTx ? this.lastTx.index + 1 : 1
        };

        if (!this.txHandler) {
            return;
        }
    };

    protected handleNewBlock = (blockHash: string, _block?: Infura.Block | BitcoinJS.Block): void => {
        // this.log('New block', blockHash);

        this.lastBlock = {
            hash: blockHash,
            time: new Date(),
            index: this.lastBlock ? this.lastBlock.index + 1 : 1
        };

        if (!this.txHandler) {
            return;
        }
    };

    protected log(eventName: string, ...data: any[]): void {
        console.log(`[${this.coin}] [${eventName}]`, ...data);
    }
}
