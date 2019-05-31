'use strict';

const ws = require('ws');
const assert = require('assert');

const logger = require('../lib/logger');
const log = new logger('test/overseer');

async function list_procs ()
{
  const rsp = await send_req({op: 'ListProcs'});
  log.log(rsp);
}

async function send_req (req)
{
  return new Promise(function(resolve, reject) {
    const w = new ws('ws://localhost:9090');
    w.on('open', () => { w.send(JSON.stringify(req)); });
    w.on('message', (data) => { resolve(JSON.parse(data)); });
    w.on('error', reject);
  });
}

(async () => {
  try {
    await list_procs();
    // await get_proc();
    // await start_proc();
    // await stop_proc();
    // await restart_proc();

  } catch(err) {
    log.error(err);
  }
})();
