'use strict';

const bitmex = require('./lib/bitmex');
const logger = require('./lib/logger');

const log = new logger(`[Peron/ml]`);

const bitmex_opts = {
  method: 'GET',
  api: 'trade/bucketed',
  testnet: false
};

const bitmex_params = {
  symbol: 'XBTUSD',
  binSize: '1m',
  count: 10,
  startTime: 0,
  partial: false,
};

async function go (){
  try {
    const rsp = await bitmex.api(bitmex_opts, bitmex_params);
    log.log(rsp);

  } catch(err) {
    log.error(err);
  }
}
