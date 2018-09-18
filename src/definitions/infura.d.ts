declare namespace Infura {
    export type BlockNumber = number | string | 'latest';

    export type JsonRPCResponse = {
        id: number;
        jsonrpc: string;
        result?: any;
        error?: {
            code: number;
            message: string;
        }
    }

    export interface Block {
        difficulty: string;
        extraData: string;
        gasLimit: string;
        gasUsed: string;
        hash: string;
        logsBloom: string;
        miner: string;      // Miner Address
        mixHash: string;
        nonce: string;
        number: string;
        parentHash: string;
        receiptsRoot: string;
        sha3Uncles: string;
        size: string;
        stateRoot: string;
        timestamp: string;
        totalDifficulty: string;
        transactions: Transaction[];
        transactionsRoot: string;
        uncles: string[];
    }


    export interface Transaction {
        blockHash?: string;
        blockNumber?: string;
        blockTime?: string;
        hash: string;
        from: string;
        to: string;
        gas: string;
        gasPrice: string;
        input: string;
        value: string;
        nonce: string;
        transactionIndex: string;
        r: string;
        s: string;
        v: string;
    }

    export interface TransactionReceipt {
        blockHash: string;
        blockNumber: string;
        contractAddress: string;
        cumulativeGasUsed: string;
        from: string;
        gasUsed: string;
        logs: any[];
        logsBloom: string;
        status: string;
        to: string;
        transactionHash: string;
        transactionIndex: string;
    }

}