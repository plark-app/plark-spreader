import EventEmitter from 'events';

export enum Events {
    UpdateCoin = 'update-coin',
    HandleTX = 'tx',
}

export const eventEmitter = new EventEmitter();
