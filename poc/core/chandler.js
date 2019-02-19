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

  setTimeout(closeCandle, getTimeout());
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
  bb.emit('SendAdapterMsg', 'unsubscribe', [`tradeBin${cfg.timeframe}:${cfg.symbol}`]);
  bb.emit('CandleClosed', c);
  historic = null;
}

function onTradeReceived (t)
{
  if (!candle) { return; }

  if (candle.o == null) { candle.o = t.price; }
  if (t.price > candle.h) { candle.h = t.price; }
  if (t.price < candle.l) { candle.l = t.price; }
  candle.c = t.price;
  cande.v += t.foreignNotional;
}

function closeCandle ()
{
  log.log('CLOSING CANDLE!');

  if (historic) {
    log.log('haven\'t broadcasted the first candle yet');
    return;
  } else {
    bb.emit('CandleClosed', candle);
  }

  candle.o = null;
  candle.h = null;
  candle.l = null;
  candle.c = null;
  candle.v = 0;
  candle.t = (Math.round(Date.now() / CANDLE_STEP) + 1) * CANDLE_STEP;

  console.log(candle);

  setTimeout(closeCandle, getTimeout());
}

function getTimeout ()
{
  return CANDLE_STEP - (Date.now() % CANDLE_STEP) + CLOSE_OFFSET;
}

module.exports = { plug: plug }
