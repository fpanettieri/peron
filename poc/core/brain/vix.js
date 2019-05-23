'use strict';

const cfg = require('../../cfg/peron');

const logger = require('../../lib/logger');
const log = new logger('brain/vix');

const min_vol = cfg.brain.min_vol;
const max_vol = cfg.brain.max_vol;

let bb = null;

function plug (_bb)
{
  bb = _bb;
  bb.on('CandleAnalyzed', onCandleAnalyzed);
}

function onCandleAnalyzed (c)
{
  if (c.c > c.ema && c.vix_top >= min_vol and c.vix_top < max_vol) {
    bb.emit('OpenShort', c);
  }

  if (c.c < c.ema && c.vix_bot >= min_vol && c.vix_bot < max_vol) {
    bb.emit('OpenLong', c);
  }
}

module.exports = { plug: plug };
