'use strict';

const https = require('../lib/https');
const logger = require('../lib/logger');

const log = new logger(`[test/https]`);

(async () => {
  try {
    // const rsp = await https.get('https://www.google.com');
    const rsp = await https.get('https://testnet.bitmex.com/api/v1/trade/bucketed?binSize=1m&symbol=XBTUSD&count=3&startTime=0&partial=false');

    log.log('status', rsp.status);
    log.log('headers', rsp.headers);
    log.log('body', rsp.body);
  } catch(err) {
    log.error(err);
  }
})();
