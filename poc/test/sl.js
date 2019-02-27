'use strict';

const cfg = require('../cfg/peron');
const orders = require('../lib/orders');
const logger = require('../lib/logger');
const log = new logger('[test/auth]');

const cl_id = `ag-${Math.random().toString(36).substr(2, 8)}`;
let rsp = null;

const price = 3809.5;

function sleep (ms)
{
  return new Promise(resolve=>{ setTimeout(resolve, ms); });
}

(async () => {
  try {
    log.debug('Market Order');
    await orders.create(`${cl_id}-mk`, 'XBTUSD', 1, 'Market');
    await sleep(3000);

    log.debug('Limit Order');
    await orders.create(`${cl_id}-lm`, 'XBTUSD', 1, 'Limit', price, 'ParticipateDoNotInitiate');
    await sleep(3000);

    log.debug('Take Profit');
    await orders.create(`${cl_id}-tp`, 'XBTUSD', -1, 'Limit', price + 1000, 'ReduceOnly');
    await sleep(3000);

    log.debug('Hard Stop');
    await orders.create(`${cl_id}-sl`, 'XBTUSD', -1, 'Stop', price - 1000, 'ReduceOnly');
    await sleep(3000);

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
