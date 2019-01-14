'use strict';

const https = require('../lib/https');
const logger = require('../lib/logger');

const log = new logger(`[test/https]`);

(async () => {
  const rsp = await https.get('www.google.com');
  log.log('headers', rsp.headers);
  log.log('body', rsp.body);
})();
