'use strict';

const crypto = require('crypto');

const https = require('./https');
const Logger = require('./logger');
const log = new Logger('lib/bitmex');

const AUTH_EXPIRES = 30;
const WARN_RATE_LIMIT = 100;
const MIN_RATE_LIMIT = 20;

async function api (opts, params)
{
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

  const headers = {
    'api-expires': expires,
    'api-key': process.env.BITMEX_KEY,
    'api-signature': signature,
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': body.length
  };

  const host = `https://${opts.testnet ? 'testnet' : 'www'}.bitmex.com`;
  let rsp = null;

  try {
    rsp = await https.send(`${host}${url}`, body, {method: opts.method, headers: headers});
    rsp.body = JSON.parse(rsp.body);
  } catch (err) {
    log.fatal(err);
  }

  const limit = rsp.headers['x-ratelimit-remaining'];
  if(limit < WARN_RATE_LIMIT) { log.warn('rate-limit:', limit); }
  if(limit < MIN_RATE_LIMIT) { log.fatal('rate-limit exceeded'); }

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

function overload ()
{
  return {
    status: { code: 503, msg: 'Service Unavailable' },
    headers: { },
    body: { error: { message: 'The system is currently overloaded. Please try again later.', name: 'HTTPError' } }
  };
}

module.exports = {
  api: api,
  toObj: toObj,
  toOhlc: toOhlc,
  overload: overload
};
