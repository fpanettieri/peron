'use strict';

const cp = require('child_process');

const logger = include('lib/logger');
const log = new logger('core/overseer');

let bb = null;

function plug (_bb)
{
  bb = _bb;

  if (cfg.overseer === undefined) { log.fatal('invalid configuration'); }
  if (cfg.overseer.strategies === undefined) { cfg.overseer.strategies = [] }

  cfg.overseer.strategies.forEach(forkStrategy);
}

function forkStrategy (strategy)
{
  log.log('forking strategy', strategy);
  const s_cfg_file = `${base_dir}/${strategy}`;
  const s_cfg = require(`${base_dir}/${strategy}`);
  const forked = cp.fork(`${base_dir}/ag`, [`${base_dir}/${strategy}`], {
    cwd: base_dir,
    detached: cfg.overseer.detach
  });

  forked.on('message', (m) => {
    console.log('PARENT got message:', m);
  });

  log.log('forked', forked);
}

module.exports = { plug: plug };
