import { Coin } from '@plark/wallet-core';

export const coins: Coin.Unit[] = Object.keys(Coin.coinMap) as Coin.Unit[];
