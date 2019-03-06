'use strict';

const fs = require('fs');
const https = require('../lib/https');
const Logger = require('../lib/logger');
const log = new Logger('[tv/watchlist]');

const INFO_URL = 'https://api.binance.com/api/v1/exchangeInfo';
const BTC_REGEX = /BTC$/;
const OUT_FILE = 'doc/binance_watch.txt';

(async () => {
  log.info('updating watchlist');

  log.info('fetching symbols');
  const rsp = await https.send(INFO_URL, null, {method: 'GET'});
  const json = JSON.parse(rsp.body);

  log.info('updating list');
  const symbols = json.symbols.map(i => `BINANCE:${i.symbol}`);
  const btc_sym = symbols.filter(s => BTC_REGEX.test(s));

  log.info('writing file');
  fs.writeFileSync(OUT_FILE, `BITMEX:XBTUSD,${btc_sym.join(',')}`);

  log.info('watchlist updated');
})();
