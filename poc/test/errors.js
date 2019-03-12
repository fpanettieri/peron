'use strict';

const assert = require('assert');

const cfg = require('../cfg/peron');
const orders = require('../lib/orders');
const logger = require('../lib/logger');
const log = new logger('[test/auth]');

let order = null;

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}-in`;
}

function sleep (ms)
{
  return new Promise(resolve=>{ setTimeout(resolve, ms); });
}

async function slippage ()
{
  order = await orders.limit(genId(), 'XBTUSD', 1, 4000);
  assert(order.ordStatus == 'Canceled');

  order = await orders.limit(genId(), 'XBTUSD', -1, 3000);
  assert(order.ordStatus == 'Canceled');
}

async function duplicated ()
{
  rsp = await orders.limit(genId(), 'XBTUSD', 1, 4000);
  log.log(rsp);

  rsp = await orders.limit(genId(), 'XBTUSD', -1, 3000);
  log.log(rsp);
}

(async () => {
  try {
    await slippage();



  } catch(err) {
    log.error(err);
  }
})();
