'use strict';

const bitmex = require('../lib/bitmex');
const logger = require('../lib/logger');
const log = new logger('test/auth');

const options = { method: 'GET', api: 'trade/bucketed', testnet: true };
const params = {
  symbol: 'XBTUSD',
  binSize: '1m',
  partial: false,
  count: 2,
  reverse: true
};

(async () => {
  try {
    const rsp = await bitmex.api(options, params);
    log.log(rsp);
  } catch(err) {
    log.error(err);
  }
})();
