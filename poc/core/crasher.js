'use strict';

const bitmex = include('lib/bitmex');
const logger = include('lib/logger');
const log = new logger('core/crasher');

let bb = null;

function plug (_bb)
{
  bb = _bb;
  bb.on('ForceCrash', onForceCrash);

  cfg.crasher.timeout
  setTimeout(onForceCrash, cfg.crasher.timeout);
}

function onForceCrash ()
{
  log.fatal('R2r sends his regards');
}

module.exports = { plug: plug };
