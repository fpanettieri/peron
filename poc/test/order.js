'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const logger = require('../lib/logger');
const log = new logger('[test/auth]');

const options = { method: 'POST', api: 'order', testnet: true };
const params = {
  symbol: 'XBTUSD',
  side: 'Buy',
  orderQty: 1,
  timeInForce: 'GoodTillCancel',
  clOrdID: `ag-${Math.random().toString(36).substr(2, 8)}`,
  ordType: 'Limit',
  price: 3000,
  execInst: 'ParticipateDoNotInitiate'
};

(async () => {
  try {
    const rsp = await bitmex.api(options, params);
    log.log(rsp);
  } catch(err) {
    log.error(err);
  }
})();
