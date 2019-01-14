'use strict';

const crypto = require('crypto');
const https = require('./https');

const Logger = require('./logger');
const log = new Logger('[lib/bitmex]');

async function api (opts, params)
{
  const expires = ~~(Date.now() / 1000 + 24 * 60 * 60);
  log.log('expires', expires);

  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  const path = `/api/v1/${opts.api}?${query}`;
  log.log('path', path);

  const signature = crypto.createHmac('sha256', process.env.BITMEX_SECRET).update(`${opts.method}${path}${expires}`).digest('hex');
  log.log('signature', signature);

  const headers = {
    'content-type' : 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'api-expires': expires,
    'api-key': process.env.BITMEX_KEY,
    'api-signature': signature
  };

  const host = `https://${opts.testnet ? 'testnet' : 'www'}.bitmex.com`;
  log.log('host', host);

  const rsp = await https.send(`${host}${path}`, null, {method: opts.method});
  log.log(rsp);

  return rsp;
}


module.exports = {
  api: api
}
