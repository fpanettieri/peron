'use strict';

const cfg = require('../cfg/peron');

const logger = require('../lib/logger');
const log = new logger('[core/brain]');

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

  log.log('previous', previous);
  log.log('current', current);
  
  if (!previous) {
    log.log('no previous');
    return;
  }

  log.log('================================');
  log.log('  OpenShort:', previous.c > previous.bb_upper && current.c < current.bb_upper && current.c > current.bb_ma);
  log.log('================================');
  log.log('previous.c > previous.bb_upper', previous.c > previous.bb_upper);
  log.log('current.c < current.bb_upper', current.c < current.bb_upper);
  log.log('current.c > current.bb_ma', current.c > current.bb_ma);
  log.log('');
  if (previous.c > previous.bb_upper && current.c < current.bb_upper && current.c > current.bb_ma) {
    bb.emit('OpenShort', current);
  }

  log.log('================================');
  log.log('  OpenLong:', previous.c < previous.bb_lower && current.c > current.bb_lower && current.c < current.bb_ma);
  log.log('================================');
  log.log('previous.c < previous.bb_lower', previous.c < previous.bb_lower);
  log.log('current.c > current.bb_lower', current.c > current.bb_lower);
  log.log('current.c < current.bb_ma', current.c < current.bb_ma);
  log.log('');
  if (previous.c < previous.bb_lower && current.c > current.bb_lower && current.c < current.bb_ma) {
    bb.emit('OpenLong', current);
  }

  log.log('================================');
  log.log('  CloseShort:', previous.h > previous.bb_ma && current.l < current.bb_ma);
  log.log('================================');
  log.log('previous.h > previous.bb_ma', previous.h > previous.bb_ma);
  log.log('current.l < current.bb_ma', current.l < current.bb_ma);
  log.log('');
  if (previous.h > previous.bb_ma && current.l < current.bb_ma) {
    bb.emit('CloseShort', current);
  }

  log.log('================================');
  log.log('  CloseLong:', previous.l < previous.bb_ma && current.h > current.bb_ma);
  log.log('================================');
  log.log('previous.l < previous.bb_ma', previous.l < previous.bb_ma);
  log.log('current.h > current.bb_ma', current.h > current.bb_ma);
  log.log('');
  if (previous.l < previous.bb_ma && current.h > current.bb_ma) {
    bb.emit('CloseLong', current);
  }
}

module.exports = { plug: plug }
