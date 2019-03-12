'use strict';

const assert = require('assert');

const cfg = require('../cfg/peron');
const orders = require('../lib/orders');
const logger = require('../lib/logger');
const log = new logger('[test/orders]');

let order = null;

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}-in`;
}

function sleep (ms)
{
  return new Promise(resolve=>{ setTimeout(resolve, ms); });
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
    await amend_non_existent();

  } catch(err) {
    log.error(err);
  }
})();
