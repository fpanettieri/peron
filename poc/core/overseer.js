'use strict';

const cp = require('child_process');
const ws = require('ws');

const logger = include('lib/logger');
const log = new logger('core/overseer');

let bb = null;

let procs = [];
let wss = null;

function plug (_bb)
{
  bb = _bb;

  if (cfg.overseer === undefined) { log.fatal('invalid configuration'); }
  if (cfg.overseer.procs === undefined) { cfg.overseer.procs = [] }
  if (cfg.overseer.port === undefined) { cfg.overseer.port = 8033 }

  // TODO: SSL support => https://www.npmjs.com/package/ws
  wss = new ws.Server({ port: cfg.overseer.port });
  wss.on('connection', handleConnection);

  cfg.overseer.procs.forEach(forkProc);
}

function forkProc (proc)
{
  const cfg_file = `${base_dir}/${proc}`;
  const p = cp.fork(`${base_dir}/ag`, [cfg_file], { cwd: base_dir, detached: cfg.overseer.detach });
  procs.push({ cfg: require(cfg_file), proc: p });
}

function handleConnection (conn)
{
  conn.on('message', (msg) => dispatchMessage(msg, conn));
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
  const ps = procs.map((p) => p.cfg);
  conn.send(JSON.stringify(ps));
}

module.exports = { plug: plug };
