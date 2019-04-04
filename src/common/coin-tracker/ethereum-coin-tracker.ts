import { Coin, Constants, Utils } from '@plark/wallet-core';
import BigNumber from 'bignumber.js';
import { AbstractTracker } from './abstract-tracker';
import { InfuraClient } from './explorer-clients';
import EventEmmiter, { Events } from 'common/events';
import { TransactionProvider } from 'common/providers';

const NEW_BLOCK_CHECK_TIMEOUT = 15000;
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

        EventEmmiter.emit(Events.TrackerConnected, { coin: this.getCoin() });
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
        const addresses = [];
        let estimatedAmount = new BigNumber(0);

        if (this.addresses.indexOf(tx.from) >= 0) {
            addresses.push(tx.from);
            estimatedAmount = estimatedAmount.minus(tx.value);
        }

        if (this.addresses.indexOf(tx.to) >= 0) {
            addresses.push(tx.to);
            estimatedAmount = estimatedAmount.plus(tx.value);
        }

        if (addresses.length > 0) {
            this.emitTransactionListener(tx.hash, addresses, tx);

            TransactionProvider.newTransaction(
                this.coin,
                tx.hash,
                estimatedAmount.div(Constants.WEI_PER_COIN).toNumber(),
            );
        }
    };


    protected onHandleBlock = (block: Infura.Block) => {
        this.setCurrentBlock(block);

        EventEmmiter.emit(Events.NewBlock, {
            block: block,
            blockData: {
                hash: block.hash,
                height: +block.number,
                blocktime: +block.timestamp,
            },
            coin: this.getCoin(),
        });

        block.transactions.forEach((tx: Infura.Transaction) => {
            this.onHandleTx(tx);
        });
    };
}
