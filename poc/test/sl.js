'use strict';

const orders = require('../lib/orders');
const logger = require('../lib/logger');
const log = new logger('test/auth');

const cl_id = `ag-${Math.random().toString(36).substr(2, 8)}`;
let rsp = null;

const price = 3000;

function sleep (ms)
{
  return new Promise(resolve=>{ setTimeout(resolve, ms); });
}

(async () => {
  try {
    log.info('########### CREATE');
    await orders.market(`${cl_id}-mk`, 'XBTUSD', 1);
    await orders.limit(`${cl_id}-lm`, 'XBTUSD', 1, price);
    await orders.profit(`${cl_id}-tp`, 'XBTUSD', -1, price + 2000);
    await orders.stop(`${cl_id}-sl`, 'XBTUSD', -1, price - 2000);

    await sleep(3000);

    log.info('########### UPDATE');
    await orders.amend(`${cl_id}-lm`, {price: price - 17});
    await orders.amend(`${cl_id}-tp`, {price: price + 2017});
    await orders.amend(`${cl_id}-sl`, {stopPx: price - 2017});

    await sleep(3000);

    log.info('########### DELETE');
    await orders.cancel(`${cl_id}-lm`);
    await orders.cancel(`${cl_id}-tp`);
    await orders.cancel(`${cl_id}-sl`);

  } catch(err) {
    log.error(err);
  }
})();
