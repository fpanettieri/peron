'use strict';

const bitmex = require('../lib/bitmex');
const logger = require('../lib/logger');

const log = new logger(`[test/https]`);

(async () => {
  try {
    const rsp = await bitmex.api({
      method: 'GET',
      api: 'trade/bucketed',
      testnet: true
    }, {
      symbol: 'XBTUSD',
      binSize: '1m',
      count: 10,
      startTime: 0,
      partial: false,
    });

    log.log(rsp);

  } catch(err) {
    log.error(err);
  }
})();
