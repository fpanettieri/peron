'use strict';

const cfg = require('../cfg/peron');
const utils = require('../lib/utils');
const logger = require('../lib/logger');
const log = new logger('[core/chandler]');

let bb = null;

function plug (_bb)
{
  log.log('plugging');
  bb = _bb;
  bb.on('TradeReceived', onTradeReceived);
}

function onTradeReceived (t)
{
  console.log(t);
}

module.exports = {
  plug: plug
}
