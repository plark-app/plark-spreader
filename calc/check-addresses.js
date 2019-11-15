const fs = require('fs');
const parser = require('./parser');

const argv = (() => {
    const arguments = {};

    process.argv.slice(2).map( (element) => {
        const matches = element.match( '--([a-zA-Z0-9]+)=(.*)');
        if ( matches ){
            arguments[matches[1]] = matches[2]
                .replace(/^['"]/, '').replace(/['"]$/, '');
        }
    });

    return arguments;
})();

const COIN = argv.coin || 'BTC';

const CURRENCY_MAP = {
    BTC: {
        blockbook: 'https://btc.blockbook.plark.io/api/',
        model: parser.calculateBIP,
    },
    DASH: {
        blockbook: 'https://dash1.trezor.io/api/',
        model: parser.calculateBIP,
    },
    LTC: {
        blockbook: 'https://ltc1.trezor.io/api/',
        model: parser.calculateBIP,
    },
    BCH: {
        blockbook: 'https://bch1.trezor.io/api/',
        model: parser.calculateBIP,
    },
    ETH: {
        etherscan: 'https://api.etherscan.io/api',
        model: parser.calculateETH,
    }
};

if (!COIN in CURRENCY_MAP) {
    throw new Error('Invalid COIN ' + COIN);
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

    const dir = __dirname + '/responses';
    try {
        fs.readdirSync(dir)
    } catch (e) {
        fs.mkdirSync(dir);
    }

    const storeData = `${dir}/${COIN}-response.json`;
    fs.writeFileSync(storeData, JSON.stringify({
        parsed: res.parsed(),
        balances: res.positiveBalances(),
    }));
})();
