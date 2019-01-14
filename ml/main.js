'use strict';

const crypto = require('crypto');
const https = require('https');
const logger = require('./logger');

const log = new logger(`[BitMEX/Peron-ml]`);

const method = 'GET'
log.log('method', method);

const expires = ~~(Date.now() / 1000 + 24 * 60 * 60);
log.log('expires', expires);

const path = '/api/v1/trade/bucketed?binSize=1m&symbol=XBTUSD&count=3&startTime=0&partial=false';
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

const req = https.request(options);
req.on('error', (err) => { log.error(`problem with request: ${e.message}`); });

req.once('response', (res) => {
  log.log(res.statusCode, res.statusMessage, res.headers);

  let data = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { log.log('end', data); });
});

// req.write(postData);
req.end();

//
// const data = https.get('https://testnet.bitmex.com/api/v1/trade/bucketed?binSize=1m&symbol=XBTUSD&count=3&startTime=0&partial=false')
