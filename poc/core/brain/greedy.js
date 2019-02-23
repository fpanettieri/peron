'use strict';

const cfg = require('../cfg/peron');

const logger = require('../lib/logger');
const log = new logger('[core/brain/greedy]');

let bb = null;

function plug (_bb)
{
  bb = _bb;
  bb.on('CandleAnalyzed', onCandleAnalyzed);
}

function onCandleAnalyzed (c)
{
  if (c.c > c.bb_ma) {
    bb.emit('OpenShort', c);
  }
  if (c.c < c.bb_ma) {
    bb.emit('OpenLong', c);
  }
}

module.exports = { plug: plug }
