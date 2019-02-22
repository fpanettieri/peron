'use strict';

const logger = require('../lib/logger');
const log = new logger('[core/auditor]');

let bb = null;
let start = 0;

function plug (_bb)
{
  bb = _bb;
  bb.on('CandleClosed', onCandleClosed);
  bb.on('BuyContract', onPreMarket);
  bb.on('SellContract', onPreMarket);
  // TODO: On TradeExecuted log the time elapsed
}

function onCandleClosed (c)
{
  log.log('onCandleClosed');
  start = Date.now();
}

function onPreMarket (t)
{
  log.log(`pre-market: ${Date.now() - start}ms`);
}

module.exports = { plug: plug }
