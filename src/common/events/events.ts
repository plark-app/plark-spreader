import EventEmitter from 'events';

export enum Events {
    UpdateCoin = 'update-coin',
    HandleTX = 'tx',
}

export default new EventEmitter();
