'use strict';

const assert = require('assert');

const cfg = require('../cfg/peron');
const orders = require('../lib/orders');
const logger = require('../lib/logger');
const log = new logger('test/orders');

const HASH_LEN = 10;

let order = null;

function genId ()
{
  const id = [...Array(HASH_LEN)].map(i=>(~~(Math.random()*36)).toString(36)).join('');
  return `lm-ag-${id}-0`;
}

function sleep (ms)
{
  return new Promise(resolve => { setTimeout(resolve, ms); });
}

async function crud ()
{
  const id = genId();
  order = await orders.limit(id, 'XBTUSD', 1, 1000);
  assert(orders.find(id), order);
  order = await orders.amend(id, {orderQty: 2, price: Math.round(Math.random() * 100 + 1000)});
  await orders.cancel(id);
}

async function slippage ()
{
  order = await orders.limit(genId(), 'XBTUSD', 1, 5000);
  assert(order.ordStatus == 'Slipped');
  await orders.cancel(order.clOrdID);

  order = await orders.limit(genId(), 'XBTUSD', -1, 2000);
  assert(order.ordStatus == 'Slipped');
  await orders.cancel(order.clOrdID);
}

async function duplicated ()
{
  const id = genId();

  order = await orders.limit(id, 'XBTUSD', 1, 1000);
  assert(order.ordStatus == 'New');

  order = await orders.limit(id, 'XBTUSD', 1, 1001);
  assert(order.ordStatus == 'Duplicated');

  await orders.cancel(id);
}

async function huge ()
{
  order = await orders.limit(genId(), 'XBTUSD', 100000000000000000, 1000);
  assert(order.ordStatus == 'Error');
}

async function double_cancel ()
{
  const id = genId();

  order = await orders.limit(id, 'XBTUSD', 1, 1000);
  assert(order.ordStatus == 'New');

  order = await orders.cancel(id);
  assert(order.ordStatus == 'Canceled');

  order = await orders.cancel(id);
  assert(order.ordStatus == 'DoubleCanceled');
}

async function cancel_non_existent ()
{
  order = await orders.cancel(genId());
  assert(order.ordStatus == 'NotFound');
}

async function amend ()
{
  const id = genId();
  order = await orders.limit(id, 'XBTUSD', 1, 1000);
  assert(order.ordStatus == 'New');

  order = await orders.amend(id, {orderQty: 2, price: Math.round(Math.random() * 100 + 1000)});
  assert(order.ordStatus == 'Amended');
}

async function amend ()
{
  const id = genId();
  order = await orders.limit(id, 'XBTUSD', 1, 1000);
  assert(order.ordStatus == 'New');

  order = await orders.amend(id, {orderQty: 3, price: Math.round(Math.random() * 100 + 1000)});
  assert(order.ordStatus == 'New');
}

async function double_amend ()
{
  const id = genId();
  order = await orders.limit(id, 'XBTUSD', 1, 1000);
  assert(order.ordStatus == 'New');

  order = await orders.amend(id, {orderQty: 2, price: Math.round(Math.random() * 100 + 1000)});
  assert(order.ordStatus == 'New');

  order = await orders.amend(id, {orderQty: 3, price: Math.round(Math.random() * 100 + 1000)});
  assert(order.ordStatus == 'New');
}

async function amend_slip ()
{
  const id = genId();
  order = await orders.limit(id, 'XBTUSD', 1, 1000);
  assert(order.ordStatus == 'New');

  order = await orders.amend(id, {price: 5000});
  assert(order.ordStatus == 'Slipped');

  log.log(order);
}

async function amend_canceled ()
{
  const id = genId();

  order = await orders.limit(id, 'XBTUSD', 1, 1000);
  assert(order.ordStatus == 'New');

  order = await orders.amend(id, {orderQty: 2, price: Math.round(Math.random() * 100 + 1000)});
  assert(order.ordStatus == 'New');

  order = await orders.cancel(id);
  assert(order.ordStatus == 'Canceled');

  order = await orders.amend(id, {orderQty: 3, price: Math.round(Math.random() * 100 + 1000)});
  assert(order.ordStatus == 'Invalid');
}

async function amend_non_existent ()
{
  order = await orders.amend(genId(), {orderQty: 2, price: Math.round(Math.random() * 100 + 1000)});
  assert(order.ordStatus == 'NotFound');
}

async function cancel_filled ()
{
  const id = genId();

  order = await orders.market(id, 'XBTUSD', 1);
  assert(order.ordStatus == 'Filled');

  order = await orders.cancel(id);
  assert(order.ordStatus == 'Filled');
}

async function amend_filled ()
{
  const id = genId();

  order = await orders.market(id, 'XBTUSD', 1);
  assert(order.ordStatus == 'Filled');

  order = await orders.amend(id, {orderQty: 2, price: Math.round(Math.random() * 100 + 1000)});
  assert(order.ordStatus == 'Invalid');
}

async function amend_respawn ()
{
  const id = genId();
  order = await orders.limit(id, 'XBTUSD', 1, 1000);
  assert(order.ordStatus == 'New');

  order = await orders.amend(id, {price: 5000});
  assert(order.ordStatus == 'Slipped');

  order = await orders.limit(id, 'XBTUSD', 1, 1000);
  assert(order.ordStatus == 'Duplicated');
}

async function stop_long ()
{
  order = await orders.market(genId(), 'XBTUSD', 1);
  assert(order.ordStatus == 'Filled');

  const id = genId();
  order = await orders.stop(id, 'XBTUSD', -1, safePrice(order.price * 0.9));
  assert(order.ordStatus == 'New');

  order = await orders.cancel(id);
  assert(order.ordStatus == 'Canceled');

  order = await orders.market(genId(), 'XBTUSD', -1);
  assert(order.ordStatus == 'Filled');
}

async function stop_short ()
{
  order = await orders.market(genId(), 'XBTUSD', -1);
  assert(order.ordStatus == 'Filled');
  
  const id = genId();
  order = await orders.stop(id, 'XBTUSD', 1, safePrice(order.price * 1.1));
  assert(order.ordStatus == 'New');

  order = await orders.cancel(id);
  assert(order.ordStatus == 'Canceled');

  order = await orders.market(genId(), 'XBTUSD', 1);
  assert(order.ordStatus == 'Filled');
}

function safePrice (px)
{
  return Math.round(px * 2) / 2;
}

(async () => {
  try {
    // await crud();
    // await slippage();
    // await duplicated();
    // await huge();
    // await double_cancel();
    // await cancel_non_existent();
    // await amend();
    // await double_amend();
    // await amend_slip();
    // await amend_canceled();
    // await amend_non_existent();
    // await cancel_filled();
    // await amend_filled();
    // await amend_respawn();
    await stop_long();
    await stop_short();

  } catch(err) {
    log.error(err);
  }
})();
