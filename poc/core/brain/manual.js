'use strict';

const ws = require('ws');

const logger = include('lib/logger');
const log = new logger('brain/manual');

let bb = null;
let wss = null;

function plug (_bb)
{
  bb = _bb;

  wss = new ws.Server({ port: cfg.brain.port });
  wss.on('connection', handleConnection);

  log.log(`listening on ${cfg.brain.port}`);
}

function handleConnection (conn)
{
  conn.on('message', (msg) => onMessage(msg, conn));
}

function onMessage (msg, conn)
{
  const json = JSON.parse(msg);
  switch (json.op) {
    case 'OpenLong': bb.emit('OpenLong'); break;
    case 'OpenShort': bb.emit('OpenShort'); break;
    default: log.error('unknown op', json.op);
  }
}

module.exports = { plug: plug };
