'use strict';

const logger = require('../lib/logger');
const log = new logger('[core/auditor]');

let bb = null;
let start = 0;

function plug (_bb)
{
  log.log('plugging');
  bb = _bb;
  bb.on('CandleClosed', onCandleClosed);
  bb.on('TradeExecuted', onTradeExecuted);
  // TODO: On TradeExecuted log the time elapsed
}

function onCandleClosed (c)
{
  start = Date.now();
}

function onTradeExecuted (t)
{
  log.log(`time to market: ${Date.now() - start}`);
}

module.exports = {
  plug: plug
}
