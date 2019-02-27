'use strict';

const cfg = require('../cfg/peron');
const orders = require('../lib/orders');
const logger = require('../lib/logger');
const log = new logger('[test/auth]');

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
    log.debug('Market Order');
    await orders.market(`${cl_id}-mk`, 'XBTUSD', 1);

    log.debug('Limit Order');
    await orders.limit(`${cl_id}-lm`, 'XBTUSD', 1, price);

    log.debug('Take Profit');
    await orders.profit(`${cl_id}-tp`, 'XBTUSD', -1, price + 2000);

    log.debug('Hard Stop');
    await orders.stop(`${cl_id}-sl`, 'XBTUSD', -1, price - 2000);

    await sleep(5000);

    log.info('########### UPDATE');
    log.debug('Limit Order');
    await orders.amend(`${cl_id}-lm`, {price: price - 17});

    log.debug('Take Profit');
    await orders.amend(`${cl_id}-tp`, {price: price + 2017});

    log.debug('Hard Stop');
    await orders.amend(`${cl_id}-sl`, {stopPx: price - 2017});

    // log.info('################ UPDATE');
    // rsp = await orders.amend(`${cl_id}`, Math.round(Math.random() * 1000 + 1000));
    //
    // await sleep(5000);
    //
    // log.info('################ DELETE');
    // rsp = await orders.cancel(`${cl_id}`);
    // log.log(rsp);

  } catch(err) {
    log.error(err);
  }
})();
