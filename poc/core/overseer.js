'use strict';

const cp = require('child_process');
const ws = require('ws');

const logger = include('lib/logger');
const log = new logger('core/overseer');

let bb = null;

let strategies = [];
let wss = null;

function plug (_bb)
{
  bb = _bb;

  if (cfg.overseer === undefined) { log.fatal('invalid configuration'); }
  if (cfg.overseer.strategies === undefined) { cfg.overseer.strategies = [] }
  if (cfg.overseer.port === undefined) { cfg.overseer.port = 8033 }

  // TODO: SSL support => https://www.npmjs.com/package/ws
  wss = new ws.Server({ port: cfg.overseer.port });
  wss.on('connection', handleConnection);

  cfg.overseer.strategies.forEach(forkStrategy);
}

function forkStrategy (strategy)
{
  log.log('forking strategy', strategy);
  log.log('fork options', { cwd: base_dir, detached: cfg.overseer.detach });

  const cfg_file = `${base_dir}/${strategy}`;
  const proc = cp.fork(`${base_dir}/ag`, [cfg_file], { cwd: base_dir, detached: cfg.overseer.detach });
  strategies.push({ cfg: require(cfg_file), proc: proc );

  log.log('strategies', strategies);
}

function handleConnection (conn)
{
  conn.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  conn.send('hi!');
}

module.exports = { plug: plug };
