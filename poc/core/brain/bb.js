'use strict';

const logger = include('lib/logger');
const log = new logger('brain/bb');

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

  if (previous.c < previous.bb_lower && current.c > current.bb_lower) {
    bb.emit('OpenLong', current.c);
  }

  if (previous.c > previous.bb_upper && current.c < current.bb_upper) {
    bb.emit('OpenShort', current.c);
  }

  skip = cfg.brain.skip;
}

module.exports = { plug: plug };
