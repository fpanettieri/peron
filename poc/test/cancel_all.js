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

    // create multiple orders
    // cancel all

    
  } catch(err) {
    log.error(err);
  }
})();
