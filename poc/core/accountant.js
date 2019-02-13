'use strict';

const logger = require('../lib/logger');
const log = new logger('[core/accountant]');

const BTS = 0.00000001;

let bb = null;
let db = null;

let balance = 0;
let positions = [];

function plug (_bb, _db)
{
  log.log('plugging');
  bb = _bb;
  db = _db;
  bb.on('BalanceUpdated', onBalanceUpdated);
  bb.on('PositionSynced', onPositionSynced);
  bb.on('PositionOpened', onPositionOpened);
  bb.on('PositionUpdated', onPositionUpdated);
  bb.on('PositionClosed', onPositionClosed);
}

function onBalanceUpdated (b)
{
  log.info(`balance updated: ${b}`);
  balance = b;
}

function onPositionSynced (data)
{
  log.info(`positions synced: ${data.length}`);
  positions = data;
}

function onPositionOpened (data)
{
  log.info(`position opened`);
  positions = positions.concat(data);
}

function onPositionUpdated (data)
{
  log.info(`position updated`);
  for (let i = 0; i < data.length; i++) {
    let pos = data[i];
    let idx = positions.findIndex(p => p.symbol == pos.symbol && p.account == pos.account && p.currency == pos.currency);
    positions[idx] = {...positions[idx], ...pos};
  }
}

function onPositionClosed (data)
{
  // TODO: implement AND TEST this
  log.error('onPositionClosed not implemented', data);
}

module.exports = {
  plug: plug
}
