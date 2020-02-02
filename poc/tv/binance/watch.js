'use strict';

const fs = require('fs');
const https = require('./https');

const INFO_URL = 'https://api.binance.com/api/v1/exchangeInfo';
const BTC_REGEX = /BTC$/;
const OUT_FILE = './binance_watch.txt';

(async () => {
  console.info('updating watchlist');

  console.info('fetching symbols');
  const rsp = await https.send(INFO_URL, null, {method: 'GET'});
  const json = JSON.parse(rsp.body);

  console.info('updating list');
  const symbols = json.symbols.map(i => `BINANCE:${i.symbol}`);
  const btc_sym = symbols.filter(s => BTC_REGEX.test(s));

  console.info('writing file');
  fs.writeFileSync(OUT_FILE, `BITMEX:XBTUSD,${btc_sym.join(',')}`);

  console.info('watchlist updated');
})();
