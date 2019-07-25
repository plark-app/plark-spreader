const fs = require('fs');
const axios = require('axios');
const BigNumber = require('bignumber.js');
const createStatuser = require('./statuser');

const COIN = process.env.COIN || 'BTC';

const CURRENCY_MAP = {
    BTC: {
        blockbook: 'https://btc.blockbook.plark.io/api/',
        model: calculateBIP,
    },
    DASH: {
        blockbook: 'https://dash1.trezor.io/api/',
        model: calculateBIP,
    },
    LTC: {
        blockbook: 'https://ltc1.trezor.io/api/',
        model: calculateBIP,
    },
    ETH: {
        infura: 'https://mainnet.infura.io/v3/19d88e5db236483ab0e0c4e2e20f4244',
        model: calculateETH,
    }
};

if (!COIN in CURRENCY_MAP) {
    throw new Error('Invalid COIN ' + COIN);
}

async function calculateBIP(addrs, params) {
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
}


async function calculateETH(addrs, params) {
    const client = axios.create({
        baseURL: params.infura,
        headers: {
            'Content-type': 'application/json'
        }
    });

    const step = 1;
    const total = (addrs.length - addrs.length % step) / step;
    const statuser = createStatuser(total);

    for (let k = 0; k < addrs.length; k += step) {
        if (addrs[k].length === 0) {
            continue;
        }

        try {
            const { data } = await client.post('', {
                jsonrpc: '2.0',
                method: 'eth_getBalance',
                params: [addrs[k], 'latest'],
                id: 1,
            });

            statuser.incrementBalance(addrs[k], new BigNumber(data.result).div(1E18));
            const parsed = statuser.increment();

            if (parsed % 50 === 0) {
                statuser.renderStatus();
            }
        } catch (error) {
            console.log(`Parse address Error [${addrs[k]}]: ${error.message}`);
        }
    }

    return statuser;
}

(async function () {
    const fileName = __dirname + `/stubs/${COIN}-addrs.txt`;

    if (!fs.existsSync(fileName)) {
        throw new Error(`Address list for ${COIN} not Found`);
    }

    const fileText = fs.readFileSync(fileName).toString();
    const addrs = fileText.split(`\n`);
    const params = CURRENCY_MAP[COIN];
    const res = await params.model(addrs, params);

    console.log(`Total: ${res.parsed()} | Balance: ${res.balance().toFormat(4)} | Addresses: ${res.addresses()}`);

    const storeData = __dirname + `/${COIN}-response.json`;
    fs.writeFileSync(storeData, JSON.stringify({
        parsed: res.parsed(),
        balances: res.positiveBalances(),
    }));
})();
