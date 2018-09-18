declare namespace Insight {
    export type InsightEventTransaction = {
        txid: string;
        isRBF: boolean;
        txlock: boolean;
        valueOut: number;
        vout: Array<{ [address: string]: number; }>
    };
}