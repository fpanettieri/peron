'use strict';

const cfg = require('../cfg/peron');
const utils = require('../lib/utils');
const logger = require('../lib/logger');
const log = new logger('[core/chandler]');

const CLOSE_OFFSET = cfg.chandler.offset * 1000;
const CANDLE_STEP = utils.intervalToMs(cfg.timeframe);

let bb = null;

let historic = {};
let candle = null;

function plug (_bb)
{
  log.log('plugging');
  bb = _bb;
  bb.on('HistoryDownloaded', onHistoryDownloaded);
  bb.on('CandleReceived', onCandleReceived);
  bb.on('TradeReceived', onTradeReceived);

  const timeout = CANDLE_STEP - (Date.now() % CANDLE_STEP) + CLOSE_OFFSET;
  setTimeout(closeCandle, timeout);
}

function onHistoryDownloaded (h)
{
  if (!historic) { log.fatal('unexpected history received'); }
  historic = h[h.length - 1];
}

function onCandleReceived (c)
{
  // ignore last historic candle
  if (c.t == historic.t) {
    log.log('partial candle is the same as the last in the history');
    return;
  } else {
    log.log('new candle! woohooo, only 15s late!');
  }

  // propagate the first partial candle
  historic = null;
  bb.emit('SendAdapterMsg', 'unsubscribe', `tradeBin${cfg.timeframe}:${cfg.symbol}`);
  bb.emit('CandleClosed', c);
}

function onTradeReceived (t)
{
  if (!candle) { return; }
  candle.c = t.price;
}

function closeCandle ()
{
  if (historic) {
    log.log('haven\'t broadcasted the first candle yet');
    return;
  }
  log.log('CLOSING CANDLE!');

  setTimeout(closeCandle, CANDLE_STEP);
}

module.exports = { plug: plug }
