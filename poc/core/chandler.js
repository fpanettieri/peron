'use strict';

const cfg = require('../cfg/peron');
const utils = require('../lib/utils');
const logger = require('../lib/logger');
const log = new logger('[core/chandler]');

const CLOSE_OFFSET = cfg.chandler.offset * 1000;
const CANDLE_STEP = utils.intervalToMs(cfg.timeframe);

let bb = null;
let candle = null;

function plug (_bb)
{
  log.log('plugging');
  bb = _bb;
  bb.on('CandleReceived', onCandleReceived);
  bb.on('TradeReceived', onTradeReceived);

  let timeout = CANDLE_STEP - (Date.now() % CANDLE_STEP) + CLOSE_OFFSET;
  setTimeout(closeCandle, timeout);
}

function onCandleReceived (c)
{
  log.log(c);
  if (candle) { return; }
  candle = c;
}

function onTradeReceived (t)
{
  if (!candle) { return; }
  candle.c = t.price;
}

function closeCandle ()
{
  log.log('CLOSING CANDLE!');
  setTimeout(closeCandle, CANDLE_STEP);
}

module.exports = { plug: plug }
