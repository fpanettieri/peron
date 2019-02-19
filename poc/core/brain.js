'use strict';

const cfg = require('../cfg/peron');

const logger = require('../lib/logger');
const log = new logger('[core/brain]');

let bb = null;
let db = null;

let previous = null;
let current = null;

function plug (_bb, _db)
{
  log.log('plugging');
  bb = _bb;
  db = _db;
  bb.on('CandleAnalyzed', onCandleAnalyzed);
}

async function onCandleAnalyzed (c)
{
  previous = current;
  current = c;
  if (!previous) { return; }

  if (previous.c > previous.bb_upper && current.c < current.bb_upper && current.c > current.bb_ma) {
    bb.emit('OpenShort', current);
  }

  if (previous.c < previous.bb_lower && current.c > current.bb_lower && current.c < current.bb_ma) {
    bb.emit('OpenLong', current);
  }

  if (previous.c > previous.bb_ma && current.c < current.bb_ma) {
    bb.emit('CloseShort', current);
  }

  if (previous.c < previous.bb_ma && current.c > current.bb_ma) {
    bb.emit('CloseLong', current);
  }
}

module.exports = {
  plug: plug
}
