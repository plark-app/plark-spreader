const axios = require('axios');
const _ = require('lodash');
const BigNumber = require('bignumber.js');
const createStatuser = require('../statuser');


module.exports = async function calculateETH(addrs, params) {
    const client = axios.create({
        baseURL: params.etherscan,
        headers: {
            'Content-type': 'application/json'
        }
    });

    const chunk = 20;
    const statuser = createStatuser(addrs.length);

    const addrChunks = _.chunk(addrs, chunk);

    for (let k = 0; k < addrChunks.length; k++) {
        if (addrChunks[k].length === 0) {
            continue;
        }

        try {
            const addresses = addrChunks[k];
            const {data} = await client.get('', {
                params: {
                    module: 'account',
                    action: 'balancemulti',
                    address: addresses.join(','),
                    tag: 'latest'
                }
            });

            let chunkAccountSize = 0;
            data.result.map((res) => {
                if (res.account.length === 0) {
                    return;
                }
                
                statuser.incrementBalance(res.account, new BigNumber(res.balance).div(1E18));
                chunkAccountSize++;
            });

            const parsed = statuser.increment(chunkAccountSize);

            if (parsed % 100 === 0) {
                statuser.renderStatus();
            }
        } catch (error) {
            console.log(`Parse address chunk [${k}]: ${error.message}`);
        }
    }

    return statuser;
};
