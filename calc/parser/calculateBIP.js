const axios = require('axios');
const BigNumber = require('bignumber.js');
const createStatuser = require('../statuser');

module.exports = async function calculateBIP(addrs, params) {
    const client = axios.create({
        baseURL: params.blockbook
    });

    const step = 1;
    const total = (addrs.length - addrs.length % step) / step;
    const statuser = createStatuser(total);

    for (let k = 0; k < addrs.length; k += step) {
        if (addrs[k].length === 0) {
            continue;
        }

        try {
            const {data} = await client.get('/address/' + addrs[k]);
            statuser.incrementBalance(addrs[k], data.balance);
            const parsed = statuser.increment();

            if (parsed % 50 === 0) {
                statuser.renderStatus();
            }
        } catch (error) {
            console.log(`Parse address Error [${addrs[k]}]: ${error.message}`);
        }
    }

    return statuser;
};