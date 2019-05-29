'use strict';

const logger = include('lib/logger');
const log = new logger('brain/rnd');

let bb = null;

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
