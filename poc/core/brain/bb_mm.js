'use strict';

const logger = require('../../lib/logger');
const log = new logger('brain/bb_mm');

let bb = null;
let previous = null;
let current = null;

let skip = cfg.brain.skip;

function plug (_bb)
{
  bb = _bb;
  bb.on('CandleAnalyzed', onCandleAnalyzed);
}

function onCandleAnalyzed (c)
{
  previous = current;
  current = c;
  if (!previous) { return; }
  if (skip--) { return; }

  if (c.c > c.bb_upper) {
    bb.emit('OpenShort', c);
  }

  if (c.c < c.bb_lower) {
    bb.emit('OpenLong', c);
  }

  skip = cfg.brain.skip;
}

module.exports = { plug: plug };
