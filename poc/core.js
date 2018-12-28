'use strict';

const crypto = require('crypto');

const DMS_INTERVAL = 15 * 1000;
const DMS_TIMEOUT = 60 * 1000;

let ws = null;
let log = null;

let limit = 1;

function noop () {}

function init (_ws, _log) {
  ws = _ws;
  log = _log;
}

function open () {
  log.info('connection established');
  log.log(process.env.BITMEX_SECRET, process.env.BITMEX_KEY);
  auth();
}

function auth () {
  const expires = ~~(Date.now() / 1000 + 24 * 60 * 60);
  log.log('GET/realtime' + expires);

  const signature = crypto.createHmac('sha256', process.env.BITMEX_SECRET).update('GET/realtime' + expires).digest('hex');
  const auth_params = {
    op: 'authKeyExpires',
    args: [ process.env.BITMEX_KEY, expires, signature ]
  }
  ws.send(JSON.stringify(auth_params));
}

function dms () {
  ws.send(JSON.stringify({op: 'cancelAllAfter', args: DMS_TIMEOUT}));
  setTimeout(dms, DMS_INTERVAL);
}

function subscribe () {
  // TODO: continue here;
  // subscribe
  // Check open positions
  // {"op": "subscribe", "args": ["trade:XBTUSD","instrument:XBTUSD"]}
  //
  const sub_params = {
    op: 'subscribe',
    args: [ 'quoteBin1m:XBTUSD' ]
    // args: [ 'quote:XBTUSD' ]
    // args: [ 'orderBookL2_25:XBTUSD' ]
    // args: [ 'liquidation' ]
    // args: [ 'funding:XBTUSD' ]
    // args: [ 'trade:XBTUSD' ]
    // args: [ 'instrument:XBTUSD' ]
    // args: [ 'wallet' ]
  }
  ws.send(JSON.stringify(sub_params));
  // log.log('subscribe request!');
}

let i = 0;
function dispatch (data) {
  const json = JSON.parse(data);
  // log.log('msg received', data);

  if ('error' in json) {
    log.error(json.error);

  } else if ('info' in json) {
    if ('limit' in json) {
      limit = json.limit.remaining;
      log.info('limit updated', limit);
    }

  } else if ('success' in json) {
    log.log(json);

    switch(json.request.op) {
      case 'authKeyExpires': {
        subscribe();
        dms();
      } break;

      // case ...
    }
  } else if ('table' in json) {
    log.log(i++, Date.now(), json.data.length, '\n', json);
    // log.log(json.table, json.action, Object.keys(json.data[0]).length, Date.now());
  }
}

function close (code, reason) {
  log.info('connection closed:', code, reason);
}

function error (err) {
  log.error(err);
}

// TODO: algo
// - auth
// . fetch open positions
// . start keepalive
// . fetch orderbook & price
// . $$$

module.exports = {
  init: init,
  open: open,
  dispatch: dispatch,
  close: close,
  error: error,
}
