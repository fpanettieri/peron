'use strict';

const logger = include('lib/logger');
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
  if (c.c > c.ema && c.vix_top >= min_vol && c.vix_top < max_vol) {
    bb.emit('OpenShort', c.c);
  }

  if (c.c < c.ema && c.vix_bot >= min_vol && c.vix_bot < max_vol) {
    bb.emit('OpenLong', c.c);
  }
}

module.exports = { plug: plug };
