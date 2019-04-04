import { Coin } from '@plark/wallet-core';
import { BlockModel } from 'models';

export async function newBlock(coin: Coin.Unit, block: any): Promise<block.BlockInstance> {
    const [blockInstance] = await BlockModel.findOrCreate({
        where: {
            coin: coin,
            hash: block.hash,
        },
        defaults: {
            coin: coin,
            hash: block.hash,
            blocktime: block.blocktime,
            height: block.height,
            original: block.original || {},
        },
    });

    return blockInstance;
}
