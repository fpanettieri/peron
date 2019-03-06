// import requests
//
// data = requests.get('https://api.binance.com/api/v1/exchangeInfo').json()
// symbols = map(lambda x: 'BINANCE:{}'.format(x['symbol']), data['symbols'])
// symbols = filter(lambda x: 'BTC' in x, symbols)
//
// print(','.join(symbols))

'use strict';

const https = require('../lib/https');
const Logger = require('../lib/logger');
const log = new Logger('[tv/watchlist]');

const INFO_URL = 'https://api.binance.com/api/v1/exchangeInfo';

(async () => {
  const rsp = await https.send(INFO_URL, null, {method: 'GET'});
  const json = JSON.parse(rsp.body);

  log.log(json);
})();
