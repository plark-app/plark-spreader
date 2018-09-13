import { Coin } from '@berrywallet/core';

export const coins: Coin.Unit[] = Object.keys(Coin.coinMap) as Coin.Unit[];
