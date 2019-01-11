'use strict';

const crypto = require('crypto');
const https = require('https');
const logger = require('./logger');

const log = new logger(`[BitMEX/Peron-ml]`);

// const expires = ~~(Date.now() / 1000 + 24 * 60 * 60);
// log.log('GET/realtime' + expires);
// const signature = crypto.createHmac('sha256', process.env.BITMEX_SECRET).update('GET/realtime' + expires).digest('hex');
// const auth_params = {
//   op: 'authKeyExpires',
//   args: [ process.env.BITMEX_KEY, expires, signature ]
// }

const method = 'GET'
log.log('method', method);

const expires = ~~(Date.now() / 1000 + 24 * 60 * 60);
log.log('expires', expires);

const path = '/api/v1/quote?count=100&reverse=false';
log.log('path', path);

const signature = crypto.createHmac('sha256', process.env.BITMEX_SECRET).update(`${method}${path}${expires}`).digest('hex');
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
  host: 'testnet.bitmex.com',
  path: path,
  method: method,
  headers: headers
};

const req = https.get(options);
req.once('response', (res) => {
  log.log('response');
  log.log(res);
});

req.end();
