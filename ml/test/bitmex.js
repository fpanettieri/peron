'use strict';

const bitmex = require('../lib/bitmex');
const logger = require('../lib/logger');

const log = new logger(`[test/https]`);

(async () => {
  try {
    const rsp = await bitmex.req({
      api: 'trade/bucketed',
      symbol: 'XBTUSD',
      binSize: '1m',
      count: 3,
      startTime: 0,
      partial: false,
      testnet: true
    });

    log.log(rsp);

  } catch(err) {
    log.error(err);
  }
})();
