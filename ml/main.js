'use strict';

const crypto = require('crypto');
const http = require('http');
const logger = require('./logger');

const log = new logger(`[BitMEX/Peron-ml]`);

// const expires = ~~(Date.now() / 1000 + 24 * 60 * 60);
// log.log('GET/realtime' + expires);
// const signature = crypto.createHmac('sha256', process.env.BITMEX_SECRET).update('GET/realtime' + expires).digest('hex');
// const auth_params = {
//   op: 'authKeyExpires',
//   args: [ process.env.BITMEX_KEY, expires, signature ]
// }

const expires = ~~(Date.now() / 1000 + 24 * 60 * 60);
log.log('expires', expires);

const url = '/api/v1/quote?count=100&reverse=false';
log.log('url', url);

const signature = crypto.createHmac('sha256', process.env.BITMEX_SECRET).update(`GET${url}${expires}`).digest('hex');
log.log('signature', signature);

const headers = {
  'content-type' : 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'api-expires': expires,
  'api-key': process.env.BITMEX_KEY,
  'api-signature': signature
};
log.log(headers);

const options = {
  protocol: 'https:'
  host: 'testnet.bitmex.com',
  path: url,
  headers: headers,
  method: 'GET',
  body: ''
};

const req = http.get(options);
req.end();
req.once('response', (res) => {

  log.log(res);
});
