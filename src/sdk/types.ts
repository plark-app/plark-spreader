export type NotificationPayload = {
    type: 'transaction'
};

export type TransactionPayload = NotificationPayload & {
    coin: string;
    status: 'new' | 'confirmation';
    txid: string;
    addresses: string;
    tx: string;
}
