'use strict';

const crypto = require('crypto');

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
  const expires = Date.now() + 24 * 60 * 60 * 1000;
  const signature = crypto.createHmac('sha256', process.env.BITMEX_SECRET).update('GET/realtime' + expires).digest('hex');
  const auth_params = {
    op: 'authKeyExpires',
    args: [ process.env.BITMEX_KEY, expires, signature ]
  }
  ws.send(JSON.stringify(auth_params));
}

function subscribe () {
  // TODO: continue here;
  // subscribe
  // Check open positions
  // {"op": "subscribe", "args": ["trade:XBTUSD","instrument:XBTUSD"]}
  //
  const sub_params = {
    op: 'authKeyExpires',
    args: [ 'wallet' ]
  }
  ws.send(JSON.stringify(sub_params));
}

function dispatch (data) {
  const json = JSON.parse(data);
  log.log('msg received', data);

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
      } break;

      // case ...
    }
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
