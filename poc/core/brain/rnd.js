'use strict';

const cfg = require('../../cfg/peron');

const logger = require('../../lib/logger');
const log = new logger('brain/rnd');

let bb = null;

let skip = cfg.brain.skip;

function plug (_bb)
{
  bb = _bb;
  bb.on('CandleAnalyzed', onCandleAnalyzed);
}

function onCandleAnalyzed (c)
{
  if (Math.random() >= 0.5) {
    bb.emit('OpenShort', c);
  } else {
    bb.emit('OpenLong', c);
  }
}

module.exports = { plug: plug };
