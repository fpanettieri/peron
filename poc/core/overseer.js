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
  const cfg_file = `${base_dir}/${strategy}`;
  const proc = cp.fork(`${base_dir}/ag`, [cfg_file], { cwd: base_dir, detached: cfg.overseer.detach });
  strategies.push({ cfg: require(cfg_file), proc: proc });
}

function handleConnection (conn)
{
  conn.on('message', (msg) => dispatchMessage(msg, conn));
  conn.send('[ag]');
}

function dispatchMessage (msg, conn)
{
  const json = JSON.parse(msg);
  switch (json.op) {
    case 'ListProcs': listProcs(conn); break

    default: log.error('unknown op', json.op);
  }
}

function listProcs (conn)
{
  conn.send(JSON.stringify(strategies));
}

module.exports = { plug: plug };
