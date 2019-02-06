'use strict';

const ws = require('ws');
const crypto = require('crypto');

const logger = require('../lib/logger');
const log = new logger('[core/adapter]');

const DMS_INTERVAL = 15 * 1000;
const DMS_TIMEOUT = 60 * 1000;

let bb = null;
let db = null;

let socket = null;
let limit = 0;

function noop () {}

function plug (_bb, _db)
{
  log.info('plugging');
  bb = _bb;
  db = _db;

  bb.on('ConnectSocket', onConnect);
  bb.on('SyncAccount', onSyncAccount);
  bb.on('WatchMarket', onWatchMarket);
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
  log.warn('connection closed:', code, reason);
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
      bb.emit('BalanceUpdated', xbt.amount);
    } break;

    default: {
      log.warn('Unexpected msg:', json);
    }
  }
}

function onSyncAccount ()
{
  log.log('syncing account');
  const sub_params = {
    op: 'subscribe',
    args: [ 'position' ]
    // args: [ 'wallet', 'position', 'margin', 'order' ]
  }
  send(sub_params);
}

function onWatchMarket ()
{
  log.log('watching market');
  const sub_params = {
    op: 'subscribe',
    args: [ 'quote', 'quoteBin1m', 'funding' ]
  }
  send(sub_params);
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
