'use strict';

const crypto = require('crypto');
const https = require('./https');
const Logger = require('./logger');

const AUTH_EXPIRES = 30;

const log = new Logger('[lib/bitmex]');

async function api (opts, params)
{
  // ~~(n) == fast toInt
  const expires = ~~(Date.now() / 1000 + AUTH_EXPIRES);
  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  const path = `/api/v1/${opts.api}?${query}`;
  const signature = crypto.createHmac('sha256', process.env.BITMEX_SECRET).update(`${opts.method}${path}${expires}`).digest('hex');

  const headers = {
    'content-type' : 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'api-expires': expires,
    'api-key': process.env.BITMEX_KEY,
    'api-signature': signature
  };

  const host = `https://${opts.testnet ? 'testnet' : 'www'}.bitmex.com`;
  const rsp = await https.send(`${host}${path}`, null, {method: opts.method});
  rsp.body = JSON.parse(rsp.body);

  log.warn('x-ratelimit-remaining', rsp.headers['x-ratelimit-remaining']);

  return rsp;
}

function toObj (o)
{
  o.timestamp = new Date(o.timestamp);
  return o;
}

function toOhlc (o)
{
  return {
    o: o.open,
    h: o.high,
    l: o.low,
    c: o.close,
    v: o.volume,
    t: (new Date(o.timestamp)).getTime()
  };
}

module.exports = {
  api: api,
  toObj: toObj,
  toOhlc: toOhlc
}
