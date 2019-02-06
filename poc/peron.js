'use strict';

const events = require('events');

const logger = require('./lib/logger');
const mongo = require('./lib/mongo');
const adapter = require('./lib/adapter');
const accountant = require('./lib/accountant');

const log = new logger(`[Peron/main]`);
const em = new Emitter();

(async () => {
  log.info('peronizando');

  const em = new events();
  database.plug(em);
  adapter.plug(em);
  accountant.plug(em);

  em.chain('DatabaseConnected', 'ConnectSocket');
  em.chain('SocketConnected', 'DownloadHistory');
  em.chain('SocketConnected', 'DownloadHistory');

  em.emit('ConnectDatabase');
})();
