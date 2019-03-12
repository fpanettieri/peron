'use strict';

const cfg = require('../cfg/peron');
const orders = require('../lib/orders');
const logger = require('../lib/logger');
const log = new logger('[test/auth]');

const cl_id = `ag-${Math.random().toString(36).substr(2, 8)}-in`;
let rsp = null;

function sleep (ms)
{
  return new Promise(resolve=>{ setTimeout(resolve, ms); });
}

(async () => {
  try {
    rsp = await orders.create(cl_id, 'XBTUSD', 1, 2000);
    log.log(rsp);

    await sleep(5000);

    rsp = await orders.create(cl_id, 'XBTUSD', 1, 2000);
    log.log(rsp);

  } catch(err) {
    log.error(err);
  }
})();
