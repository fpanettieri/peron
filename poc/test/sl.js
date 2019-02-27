'use strict';

const cfg = require('../cfg/peron');
const orders = require('../lib/orders');
const logger = require('../lib/logger');
const log = new logger('[test/auth]');

const cl_id = `ag-${Math.random().toString(36).substr(2, 8)}`;
let rsp = null;

const price = 3807;

function sleep (ms)
{
  return new Promise(resolve=>{ setTimeout(resolve, ms); });
}

(async () => {
  try {
    log.info('################ CREATE');
    // await orders.create(`${cl_id}-lm`, 'XBTUSD', 1, price, 'Limit', 'ParticipateDoNotInitiate');
    await orders.create(`${cl_id}-lm`, 'XBTUSD', 1, price, 'Market', 'MarkPrice');

    // return;
    // await sleep(3000);

    // Take Profit seems to work
    // await orders.create(`${cl_id}-tp`, 'XBTUSD', -1, price + 5, 'Limit', 'ReduceOnly');

    // Stop Loss working!
    // await orders.create(`${cl_id}-sl`, 'XBTUSD', -1, price - 5, 'Stop', 'ReduceOnly');

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
