'use strict';

const logger = require('../lib/logger');
const log = new logger('[core/accountant]');

let bb = null;
let margin = {};
let positions = [];

function plug (_bb)
{
  bb = _bb;
  bb.on('MarginUpdated', onMarginUpdated);
  bb.on('PositionSynced', onPositionSynced);
  bb.on('PositionOpened', onPositionOpened);
  bb.on('PositionUpdated', onPositionUpdated);
  bb.on('PositionClosed', onPositionClosed);
}

function onMarginUpdated (m)
{
  margin = {...margin, ...m};
}

function onPositionSynced (data)
{
  positions = data;

  // TODO: Add support for other symbols
  // let pos = positions.find(p => p.symbol == 'XBTUSD');
  // if (pos.isOpen){ bb.emit('PreExistingPosition', pos); }
}

function onPositionOpened (data)
{
  positions = positions.concat(data);
}

function onPositionUpdated (data)
{
  for (let i = 0; i < data.length; i++) {
    let pos = data[i];
    let idx = getIndex(pos);
    positions[idx] = {...positions[idx], ...pos};
  }
}

function onPositionClosed (data)
{
  // TODO: implement AND TEST this
  log.error('onPositionClosed not implemented', data);
}

function getIndex (pos)
{
  return positions.findIndex(p => samePosition(p, pos));
}

function samePosition (a, b)
{
  return a.symbol == b.symbol && a.account == b.account && a.currency == b.currency;
}

module.exports = { plug: plug };
