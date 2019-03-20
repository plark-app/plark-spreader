import EventEmitter from 'events';

export enum Events {
    UpdateCoin = 'update-coin',
    HandleTX = 'tx',

    NewBlock = 'new-block',
    TrackerConnected = 'tracker-connected',
    TrackerDisconnected = 'tracker-disconnected'
}

export default new EventEmitter();
