'use strict';

const cfg = require('../cfg/peron');
const orders = require('../lib/orders');
const logger = require('../lib/logger');
const log = new logger('[test/auth]');

const cl_id = `ag-${Math.random().toString(36).substr(2, 8)}`;
let rsp = null;

const ITERATIONS = 100;
const PRICE = 1000;

function sleep (ms)
{
  return new Promise(resolve=>{ setTimeout(resolve, ms); });
}

(async () => {
  try {
    await orders.limit(`${cl_id}-lm`, 'XBTUSD', 1, PRICE);
    await orders.amend(`${cl_id}-lm`, {price: PRICE - 17});

    await orders.amend(`${cl_id}-lm`, {price: PRICE - Math.round(Math.random() * 100)});
    await orders.cancel(`${cl_id}-lm`);
    await orders.amend(`${cl_id}-lm`, {price: PRICE - Math.round(Math.random() * 100)});
    await orders.cancel(`${cl_id}-lm`);

  } catch(err) {
    log.error(err);
  }
})();
