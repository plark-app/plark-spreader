
<p align="center">
  <h3 align="center">Transaction and confirmation notification service</h3>
  <p align="center">
    <br/>
    <a href="https://berrywallet.io">Plark</a>
    ·
    <a href="https://chrome.google.com/webstore/detail/berrywallet/boidgcdefidhoojfljngigkjffbodjmn">Chrome Extension</a>
    ·
    <a href="https://addons.mozilla.org/firefox/addon/berrywallet">Mozilla Add-on</a>
  </p>
</p>

<hr />

## Supported currencies:

 - Bitcoin (BTC)
 - Ethereum (ETH)
 - Dash (DASH)
 - Litecoin (LTC)

**Also supports:**
 - [Bitcoin (BTCt)](https://test.btc.explorer.berrywallet.io)
 - [Dash (DASHt)](https://testnet-insight.dashevo.org/insight)
 - [Litecoin (LTCt)](https://test.ltc.explorer.berrywallet.io) 
 - [Rospten Ethereum network (ETHt)](https://ropsten.etherscan.io)



### Notification data payload:

```json
{
    "type": "transaction",
    "status": "new",
    "coin": "BTC",
    "txid": "b63e3073e97470f7716297975cf6879519ea4df67dfb085d649b37a7277a915d",
    "addresses": "[\"mhB3FsV2N31PQ5nA8nEs3x7b8T21CDVvEz\"]",
    "tx": "{\"txid\": \"b63e3073e97470f7716297975cf6879519ea4df67dfb085d649b37a7277a915d\"}",
    "amount": 102.43
}
```


---



*Created with Love by [Plark Team](https://berrywallet.io)*