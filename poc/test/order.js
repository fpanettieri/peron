'use strict';

const cfg = require('../cfg/peron');
const orders = require('../lib/orders');
const logger = require('../lib/logger');
const log = new logger('[test/auth]');

const cl_id = `ag-${Math.random().toString(36).substr(2, 8)}`;
let rsp = null;

const price = 3817.5;

function sleep (ms)
{
  return new Promise(resolve=>{ setTimeout(resolve, ms); });
}

(async () => {
  try {
    log.info('################ CREATE');
    await orders.limit(`${cl_id}-lm`, 'XBTUSD', 1, price);
    await orders.take_profit(`${cl_id}-tp`, 'XBTUSD', 1, price + 5);
    await orders.stop_loss(`${cl_id}-sl`, 'XBTUSD', 1, price - 5);
    //
    // await sleep(5000);
    //
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
