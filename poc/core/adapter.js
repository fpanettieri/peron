'use strict';

const ws = require('ws');
const crypto = require('crypto');

const logger = require('./logger');

const DMS_INTERVAL = 15 * 1000;
const DMS_TIMEOUT = 60 * 1000;

let socket = null;
let log = new logger('[Peron/ws  ]');
let ev = null;
let limit = 0;

function noop () {}

function plug (emitter, db)
{
  log.info('plugging adapter');
  ev = emitter;
  ev.on('')
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
      limit = json.limit.remaining;
      log.log(`limit updated: ${limit}`);
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
  switch (json.table) {
    case 'wallet': {
      const xbt = json.data.find((d) => d.currency === 'XBt');
      ev.emit('BalanceUpdated', xbt.amount);
    } break;

    default: {
      log.warn('Unexpected msg:', json);
    }
  }
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
  send(sub_params);
  // log.log('subscribe request!');
}

function send (msg)
{
  if (limit < 1) {
    log.error('limit reached, try again in a few seconds');
    return;
  }
  socket.send(JSON.stringify(msg));
}

module.exports = {
  plug: plug,
  send: send
}
