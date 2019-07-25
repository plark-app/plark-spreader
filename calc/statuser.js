const BigNumber = require('bignumber.js');

module.exports = function createStatuser(totalItems) {
    let startTime = new Date().getTime();
    let total = totalItems;
    let parsed = 0;
    let positiveBalances = {};
    let balance = new BigNumber(0);
    let addresses = 0;

    function incrementPositiveBalanceAddr(address, value) {
        addresses++;
        positiveBalances[address] = value;
    }

    return {
        balance: () => balance,
        parsed: () => parsed,
        addresses: () => addresses,
        positiveBalances: () => positiveBalances,
        increment(toValue = 1) {
            parsed += toValue;
            return parsed;
        },
        renderStatus() {
            const time = new Date().getTime();

            const minutes = (time - startTime) / (1000 * 60);
            const speed = new BigNumber(parsed).div(minutes);

            console.log(
                `${parsed} of ${total} (${speed.toFormat(1)} addr/min) | Bln: ${balance.toFormat(4)}`
            );
        },
        incrementBalance(address, value) {
            value = new BigNumber(value);
            if (value.gt(0)) {
                incrementPositiveBalanceAddr(address, value);
            }

            balance = balance.plus(value);
        }
    };
};