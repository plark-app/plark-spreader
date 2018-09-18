import { Coin, Utils } from '@berrywallet/core';
import { AbstractTracker } from './abstract-tracker';
import { InfuraClient } from './explorer-clients';

const NEW_BLOCK_CHECK_TIMEOUT = 15000;
// const RECONNECT_TIMEOUT = 30000;
const CONNECTION_TIMEOUT = 60000 * 10;

export class EthereumCoinTracker extends AbstractTracker {
    protected client: InfuraClient;

    protected _currentBlockHeight?: number;
    protected _currentBlockTime?: number;

    protected enableBlockTracking: boolean = false;
    protected connected: boolean = false;
    protected blockTrackInterval?: any;

    public constructor(coin: Coin.Unit) {
        super(coin);

        this.client = new InfuraClient(coin);
    }

    public async start(): Promise<void> {
        await super.start();

        await this.startBlockTracking();

        this.log('Start track', `${this.addresses.length} addrs`);
    }

    protected async startBlockTracking() {
        this.enableBlockTracking = true;

        const block = await this.trackLastOrNextBlock();
        this.setCurrentBlock(block);

        this.blockTrackInterval = setInterval(this.blockTracker, NEW_BLOCK_CHECK_TIMEOUT);
    }

    protected get currentBlockTime(): number {
        return this._currentBlockTime || 0;
    }

    protected blockTracker = async () => {
        try {
            const block = await this.trackLastOrNextBlock();
            this.onHandleBlock(block);

            await this.blockTracker();
        } catch (error) {
            if (error.blockNumber) {
                return;
            }

            throw error;
        }
    };

    protected async trackLastOrNextBlock(): Promise<Infura.Block> {
        let blockHeight: Infura.BlockNumber = 'latest';
        if (this._currentBlockHeight && (new Date().getTime() - this.currentBlockTime < CONNECTION_TIMEOUT)) {
            blockHeight = this._currentBlockHeight + 1;
        }

        return this.client.getBlock(blockHeight);
    }

    protected setCurrentBlock = (block: Infura.Block) => {
        this._currentBlockHeight = Utils.hexToBigNumber(block.number).toNumber();
        this._currentBlockTime = Utils.hexToBigNumber(block.timestamp).times(1000).toNumber();
    };

    protected onHandleTx = (tx: Infura.Transaction) => {
        this.handleNewTransaction(tx.hash, tx);

        if (this.addresses.indexOf(tx.from) >= 0) {
            this.log('From', tx.from);
        }

        if (this.addresses.indexOf(tx.to) >= 0) {
            this.log('To', tx.to);
        }
    };

    protected onHandleBlock = (block: Infura.Block) => {
        this.setCurrentBlock(block);
        this.handleNewBlock(block.hash, block);

        block.transactions.forEach((tx: Infura.Transaction) => {
            this.onHandleTx(tx);
        });
    };
}
