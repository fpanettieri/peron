'use strict';

const cfg = require('../../cfg/peron');

const logger = require('../../lib/logger');
const log = new logger('brain/bb_mm');

let bb = null;
let previous = null;
let current = null;

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

  if (c.c > c.bb_upper) {
    bb.emit('OpenShort', c);
  }

  if (c.c < c.bb_lower) {
    bb.emit('OpenLong', c);
  }
}

module.exports = { plug: plug };
