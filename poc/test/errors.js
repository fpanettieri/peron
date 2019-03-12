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
  assert(order.ordStatus == 'Slipped');

  order = await orders.limit(genId(), 'XBTUSD', -1, 3000);
  assert(order.ordStatus == 'Slipped');
}

async function duplicated ()
{
  const id = genId();
  order = await orders.limit(id, 'XBTUSD', 1, 1000);
  log.log('a', order);
  assert(order.ordStatus == 'New');

  order = await orders.limit(id, 'XBTUSD', 1, 1001);
  log.log('b', order);
  assert(order.ordStatus == 'Duplicated');
}

async function huge ()
{
  order = await orders.limit(genId(), 'XBTUSD', 100000000000000000, 4000);
}

(async () => {
  try {
    // await slippage();
    await duplicated();
    // await huge();

  } catch(err) {
    log.error(err);
  }
})();
