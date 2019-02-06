'use strict';

const logger = require('../lib/logger');
const log = new logger('[core/accountant]');

// const position_size = 0.001;

let bb = null;
let db = null;

let balance = 0;

function plug (_bb, _db)
{
  log.info('plugging');
  bb = _bb;
  db = _db;

  bb.on('BalanceUpdated', onBalanceUpdate);
  // TODO: listen for OpenPosition / ClosePosition
}

function onBalanceUpdate (b)
{
  log.info(`balance updated: ${b}`);
  balance = b;
}

module.exports = {
  plug: plug
}
