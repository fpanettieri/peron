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
  const id = genId();
  order = await orders.limit(id, 'XBTUSD', 1, 1000);
  assert(order.ordStatus != 'Canceled');

  order = await orders.limit(id, 'XBTUSD', 1, 1001);
  log.log(order);
  assert(order.ordStatus != 'Canceled');
}

(async () => {
  try {
    // await slippage();
    await duplicated();

  } catch(err) {
    log.error(err);
  }
})();
