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
  log.info(`balance updated: ${b}`);
  balance = b;
}



function onPositionClosed (data)
{
  log.error()
}
module.exports = {
  plug: plug
}
