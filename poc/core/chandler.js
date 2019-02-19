'use strict';

const cfg = require('../cfg/peron');
const utils = require('../lib/utils');
const logger = require('../lib/logger');
const log = new logger('[core/chandler]');

let bb = null;
let partial = null;

function plug (_bb)
{
  log.log('plugging');
  bb = _bb;
  bb.on('CandleReceived', onCandleReceived);
  bb.on('TradeReceived', onTradeReceived);
}

function onCandleReceived (c)
{
  log.log(c);
}

function onTradeReceived (t)
{
  log.log('trade');
}

module.exports = { plug: plug }
