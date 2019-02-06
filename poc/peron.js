'use strict';

const events = require('events');

const ws = require('./ws');
const logger = require('./logger');

const log = new logger(`[Peron/main]`);
log.info('peronizando');

const ev = new events();
ws.init('wss://testnet.bitmex.com/realtime', ev);


ev.on('BalanceUpdated', (d) => {
  console.log(d);
})
// TODO: Sync modules through the event emitter

// todo: listen to core events
// plug the brain here
