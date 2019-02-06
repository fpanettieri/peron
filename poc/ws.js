'use strict';

const ws = require('ws');

const crypto = require('crypto');

const logger = require('./logger');

const DMS_INTERVAL = 15 * 1000;
const DMS_TIMEOUT = 60 * 1000;

let socket = null;
let log = new logger('[Peron/ws  ]');
let ev = null;

function noop () {}

function init (url, emitter)
{
  log.log('initializing ws');

  ev = emitter;

  socket = new ws(url);
  socket.on('open', onOpen);
  socket.on('message', onMessage);
  socket.on('close', onClose);
  socket.on('error', onError);
}

function onClose (code, reason)
{
  log.info('connection closed:', code, reason);
}

function onError (err)
{
  log.error(err);
}

function onOpen ()
{
  log.info('connection established');
  // log.log(process.env.BITMEX_SECRET, process.env.BITMEX_KEY);
  auth();
}

function auth ()
{
  const expires = ~~(Date.now() / 1000 + 24 * 60 * 60);
  log.log('GET/realtime' + expires);

  const signature = crypto.createHmac('sha256', process.env.BITMEX_SECRET).update('GET/realtime' + expires).digest('hex');
  const auth_params = {
    op: 'authKeyExpires',
    args: [ process.env.BITMEX_KEY, expires, signature ]
  }
  socket.send(JSON.stringify(auth_params));
}

function dms ()
{
  socket.send(JSON.stringify({op: 'cancelAllAfter', args: DMS_TIMEOUT}));
  setTimeout(dms, DMS_INTERVAL);
}

function onMessage (data)
{
  const json = JSON.parse(data);

  if ('error' in json) {
    log.error(json.error);

  } else if ('info' in json) {
    if ('limit' in json) {
      ev.emit('LimitUpdated', json.limit.remaining);
    }

  } else if ('success' in json) {
    switch(json.request.op) {
      case 'authKeyExpires': {
        subscribe();
        dms();
      } break;

      default: {
        log.warn('Unexpected success msg:', json);
      }
    }
  } else if ('table' in json) {
    broadcast(json);
  }
}

function broadcast (json)
{
  // log.log(i++, Date.now(), json.data.length, '\n', json);
  log.log(json.table, json.action, Object.keys(json.data[0]).length, Date.now());
}

function subscribe ()
{
  const sub_params = {
    op: 'subscribe',
    // args: [ 'quoteBin1m:XBTUSD' ]
    // args: [ 'orderBookL2_25:XBTUSD' ]
    // args: [ 'liquidation' ]
    // args: [ 'funding:XBTUSD' ]
    // args: [ 'trade:XBTUSD' ]
    // args: [ 'instrument:XBTUSD' ]
    args: [ 'wallet' ]
    // args: [ 'wallet', 'position', 'instrument:XBTUSD', 'orderBookL2_25:XBTUSD' ]
  }
  socket.send(JSON.stringify(sub_params));
  // log.log('subscribe request!');
}
module.exports = {
  init: init,
  subscribe: subscribe
}
