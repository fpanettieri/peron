'use strict';

const logger = require('../lib/logger');
const log = new logger('[core/accountant]');

const BTS = 0.00000001;

let bb = null;
let db = null;

let balance = 0;

function plug (_bb, _db)
{
  log.log('plugging');
  bb = _bb;
  db = _db;
  bb.on('BalanceUpdated', onBalanceUpdate);
  bb.on('PositionSynced', onPositionSynced);
  bb.on('PositionOpened', onPositionOpened);
  bb.on('PositionUpdated', onPositionUpdate);
  bb.on('PositionClosed', onPositionClosed);
}

function onBalanceUpdate (b)
{
  balance = b;
  log.info(`balance updated: ${b}`);
}

function onPositionSynced (data)
{
  // TODO:
  log.fatal('not implemented', data);
}

function onPositionOpened (data)
{
  // TODO:
  log.fatal('not implemented', data);
}

function onPositionUpdate (data)
{
  // TODO:
  log.fatal('not implemented', data);
}

function onPositionClosed (data)
{
  // TODO:
  log.error('not implemented', data);
}
module.exports = {
  plug: plug
}
