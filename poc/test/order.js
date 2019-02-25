'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const logger = require('../lib/logger');
const log = new logger('[test/auth]');

const cl_id = `ag-${Math.random().toString(36).substr(2, 8)}`;
const options = { api: 'order', testnet: true };

const create_params = {
  symbol: 'XBTUSD',
  side: 'Buy',
  orderQty: 1,
  timeInForce: 'GoodTillCancel',
  clOrdID: cl_id,
  ordType: 'Limit',
  price: 2000,
  execInst: 'ParticipateDoNotInitiate'
};

const update_params = { origClOrdID: cl_id, price: Math.round(Math.random() * 1000 + 1000) };
const delete_params = { clOrdID: cl_id };

let rsp = null;

function sleep (ms)
{
  return new Promise(resolve=>{ setTimeout(resolve,ms); });
}

(async () => {
  try {
    // Create
    log.info('################ CREATE');
    options.method = 'POST';
    rsp = await bitmex.api(options, create_params);

    await sleep(5000);

    // Update
    log.info('################ UPDATE');
    options.method = 'PUT';
    rsp = await bitmex.api(options, update_params);

    await sleep(5000);

    // Delete
    log.info('################ DELETE');
    options.method = 'DELETE';
    rsp = await bitmex.api(options, delete_params);

  } catch(err) {
    log.error(err);
  }
})();
