'use strict';

const events = require('events');

const logger = require('./lib/logger');
const backbone = require('./lib/backbone');
const mongo = require('./lib/mongo');

const adapter = require('./core/adapter');
const accountant = require('./core/accountant');
const archivist = require('./core/archivist');
const analyst = require('./core/analyst');

(async () => {
  const log = new logger(`[Peron/main]`);
  log.info('peronizando');

  const db = await mongo.connect();
  const bb = new backbone();

  adapter.plug(bb, db);
  accountant.plug(bb, db);
  archivist.plug(bb, db);
  analyst.plug(bb, db);

  bb.chain('SocketConnected', 'DownloadHistory');
  bb.chain('SocketConnected', 'SyncAccount');
  // bb.chain('SocketConnected', 'WatchMarket');

  bb.on('HistoryDownloaded', (d) => {
    console.log(d);
  });

  bb.emit('ConnectSocket', 'wss://testnet.bitmex.com/realtime');
})();
