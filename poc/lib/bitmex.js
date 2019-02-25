'use strict';

const querystring = require('querystring');
const crypto = require('crypto');

const https = require('./https');
const Logger = require('./logger');

const AUTH_EXPIRES = 30;

const log = new Logger('[lib/bitmex]');

async function api (opts, params)
{
  // ~~(n) == fast toInt
  const expires = ~~(Date.now() / 1000 + AUTH_EXPIRES);
  const data = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');

  let url = `/api/v1/${opts.api}`;
  let body = '';

  if (opts.method == 'GET') {
    url += `?${data}`;
  } else {
    body = data;
  }

  const unsigned = `${opts.method}${url}${expires}${body}`;
  const signature = crypto.createHmac('sha256', process.env.BITMEX_SECRET).update(unsigned).digest('hex');

  log.log('expires', expires);
  log.log('data', data);
  log.log('url', url);
  log.log('body', body);
  log.log('unsigned', unsigned);
  log.log('signature', signature);

  const headers = {
    'api-expires': expires,
    'api-key': process.env.BITMEX_KEY,
    'api-signature': signature,
    'content-type': 'application/x-www-form-urlencoded'
  };

  const host = `https://${opts.testnet ? 'testnet' : 'www'}.bitmex.com`;
  const rsp = await https.send(`${host}${url}`, body, {method: opts.method, headers: headers});
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
};
