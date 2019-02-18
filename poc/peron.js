'use strict';

const events = require('events');

const cfg = require('./cfg/peron');

const logger = require('./lib/logger');
const backbone = require('./lib/backbone');
const mongo = require('./lib/mongo');

const adapter = require('./core/adapter');
const accountant = require('./core/accountant');
const archivist = require('./core/archivist');
const analyst = require('./core/analyst');
const brain = require('./core/brain');

(async () => {
  const log = new logger(`[Peron/main]`);
  log.info('peronizando');

  const db = await mongo.connect();
  const bb = new backbone();

  archivist.plug(bb, db);
  adapter.plug(bb, db);
  accountant.plug(bb, db);
  analyst.plug(bb, db);
  brain.plug(bb, db);

  bb.chain('SocketConnected', 'DownloadHistory');
  // bb.chain('SocketConnected', 'SyncAccount');
  bb.chain('HistoryDownloaded', 'WatchMarket');

  bb.emit('ConnectSocket', `wss://${cfg.testnet ? 'testnet' : 'www'}.bitmex.com/realtime`);
})();
