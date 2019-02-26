'use strict';

const ws = require('ws');
const crypto = require('crypto');

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const logger = require('../lib/logger');
const log = new logger('[core/adapter]');

const DMS_INTERVAL = 15 * 1000;
const DMS_TIMEOUT = 60 * 1000;

let bb = null;
let socket = null;
let limit = 0;

function noop () {}

function plug (_bb)
{
  bb = _bb;
  bb.on('ConnectSocket', onConnect);
  bb.on('WatchMarket', onWatchMarket);
  bb.on('SendAdapterMsg', onSendAdapterMsg);
}

function onConnect(url)
{
  socket = new ws(url);
  socket.on('open', onOpen);
  socket.on('message', onMessage);
  socket.on('close', onClose);
  socket.on('error', onError);
}

function onClose (code, reason)
{
  log.fatal('connection closed:', code, reason);
}

function onError (err)
{
  log.error(err);
}

function onOpen ()
{
  log.log('connection established');
  auth();
}

function auth ()
{
  const expires = ~~(Date.now() / 1000 + 365 * 24 * 60 * 60);
  log.log('GET/realtime' + expires);

  const signature = crypto.createHmac('sha256', process.env.BITMEX_SECRET).update('GET/realtime' + expires).digest('hex');
  const auth_params = {
    op: 'authKeyExpires',
    args: [ process.env.BITMEX_KEY, expires, signature ]
  };
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
      log.warn(`limit updated: ${limit}`);
    }

  } else if ('success' in json) {
    switch(json.request.op) {
      case 'authKeyExpires': {
        bb.emit('SocketConnected');
        dms();
      } break;

      case 'subscribe': {
        log.log(`subscribed successfully to '${json.subscribe}'`);
      } break;

      case 'unsubscribe': {
        log.log(`unsubscribe successfully from '${json.unsubscribe}'`);
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
  const map = { 'partial': 'Synced', 'insert': 'Opened', 'update': 'Updated', 'delete': 'Closed' };

  switch (json.table) {
    // case 'margin': {
    //   bb.emit('MarginUpdated', json.data[0]);
    // } break;

    // case 'position': {
    //   const action = `Position${map[json.action]}`;
    //   bb.silent(action, json.data);
    // } break;

    // case 'trade': {
    //   bb.silent('TradeReceived', json.data);
    // } break;

    // case 'order': {
    //   const action = `Order${map[json.action]}`;
    //   for (let i = 0; i < json.data.length; i++) { bb.emit('OrderUpdated', json.data[i]); }
    // } break;

    // case 'quote': {
    //   const action = `Quote${map[json.action]}`;
    //   bb.emit(action, json.data);
    // } break;

    case `tradeBin${cfg.timeframe}`: {
      bb.emit('CandleReceived', bitmex.toOhlc(json.data[0]));
    } break;

    default: {
      const action = `${json.table[0].toUpperCase()}${json.table.substring(1)}${map[json.action]}`;
      // FIXME: dead code
      // log.warn('########################################', action);
      // log.log(json.data);
      // log.warn('########################################', action, '\n\n\n\n');
      bb.emit(action, json.data);
    }
  }
}

function onWatchMarket ()
{
  const sub_params = {
    op: 'subscribe',
    args: [ `order:${cfg.symbol}` ]
    // FIXME: full msgs sync
    // args: [
    //   'margin',
    //   `quote:${cfg.symbol}`,
    //   `position:${cfg.symbol}`,
    //   `order:${cfg.symbol}`,
    //   `trade:${cfg.symbol}`,
    //   `tradeBin${cfg.timeframe}:${cfg.symbol}`
    // ]
  };
  send(sub_params);
}

function onSendAdapterMsg (op, args)
{
  send({op: op, args: args});
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
};
