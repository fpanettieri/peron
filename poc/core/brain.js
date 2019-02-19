'use strict';

const cfg = require('../cfg/peron');

const logger = require('../lib/logger');
const log = new logger('[core/brain]');

let bb = null;
let db = null;

function plug (_bb, _db)
{
  log.log('plugging');
  bb = _bb;
  db = _db;
  bb.on('CandleAnalyzed', onCandleAnalyzed);
}

async function onCandleAnalyzed (c)
{
  log.log('alpha!');
  // Needs 2 candle at least
  // check that the time between them is

  //bb.emit('Long');
  //bb.emit('Short');
}

module.exports = {
  plug: plug
}
