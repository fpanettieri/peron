'use strict';

const events = require('events');

const cfg = require('./cfg/peron');

const logger = require('./lib/logger');
const backbone = require('./lib/backbone');

const adapter = require('./core/adapter');
const accountant = require('./core/accountant');
const archivist = require('./core/archivist');
const chandler = require('./core/chandler');
const analyst = require('./core/analyst');
const brain = require('./core/brain');
const trader = require('./core/trader');
const auditor = require('./core/auditor');

(async () => {
  const log = new logger(`[Peron/main]`);
  log.info('peronizando');

  const bb = new backbone();
  adapter.plug(bb);
  accountant.plug(bb);
  archivist.plug(bb);
  chandler.plug(bb);
  analyst.plug(bb);
  brain.plug(bb);
  trader.plug(bb);
  auditor.plug(bb);

  bb.chain('SocketConnected', 'DownloadHistory');
  bb.chain('SocketConnected', 'SyncAccount');
  bb.chain('HistoryDownloaded', 'WatchMarket');

  bb.emit('ConnectSocket', `wss://${cfg.testnet ? 'testnet' : 'www'}.bitmex.com/realtime`);
})();
