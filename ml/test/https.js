'use strict';

const https = require('../lib/https');
const logger = require('../lib/logger');

const log = new logger(`[test/https]`);

(async () => {
  try {
    const rsp = await https.get('www.google.com');

    log.log('status', rsp.statusCode, rsp.statusMessage);
    log.log('headers', rsp.headers);
    log.log('body', rsp.body);
  } catch(err) {
    log.error(err);
  }
})();
