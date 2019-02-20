'use strict';

const cfg = require('../cfg/peron');
const utils = require('../lib/utils');
const logger = require('../lib/logger');
const log = new logger('[core/chandler]');

const CLOSE_OFFSET = cfg.chandler.offset * 1000;
const CANDLE_STEP = utils.intervalToMs(cfg.timeframe);
const STATES = { INITIAL: 0, HISTORIC: 1, BRIDGE: 2, CANDLE: 3 };

let bb = null;

let state = STATES.INITIAL;
let historic = null;
let candle = null;

function plug (_bb)
{
  bb = _bb;
  bb.on('HistoryDownloaded', onHistoryDownloaded);
  bb.on('CandleReceived', onCandleReceived);
  bb.on('TradeReceived', onTradeReceived);

  resetCandle();
  setTimeout(closeCandle, getTimeout());
}

function onHistoryDownloaded (h)
{
  if (state > STATES.INITIAL) { log.fatal('unexpected history received'); }
  state = STATES.HISTORIC;
  historic = h[h.length - 1];
}

function onCandleReceived (c)
{
  if (c.t == historic.t) { return; }
  if (state > STATES.HISTORIC) { log.fatal('unexpected candle received'); return; }
  state = STATES.BRIDGE;

  log.log('new candle! woohooo, only 15s late!');
  bb.emit('SendAdapterMsg', 'unsubscribe', [`tradeBin${cfg.timeframe}:${cfg.symbol}`]);
  bb.emit('CandleClosed', c);
}

function onTradeReceived (t)
{
  if (candle.o == null) { candle.o = t.price; }
  if (t.price > candle.h) { candle.h = t.price; }
  if (t.price < candle.l) { candle.l = t.price; }
  candle.c = t.price;
  candle.v += t.foreignNotional;
}

function closeCandle ()
{
  setTimeout(closeCandle, getTimeout());
  log.log('CLOSING CANDLE!');
  log.log(candle);

  return;

  if (historic) {
    candle = {};
    return;
  } else {
    bb.emit('CandleClosed', candle);
  }



  console.log(candle);
}

function getTimeout ()
{
  return CANDLE_STEP - (Date.now() % CANDLE_STEP) + CLOSE_OFFSET;
}

function resetCandle ()
{
  candle = {o: null, h: Number.MIN_SAFE_INTEGER, l: Number.MAX_SAFE_INTEGER, c: null, v: 0, t: (Math.round(Date.now() / CANDLE_STEP) + 1) * CANDLE_STEP};
}

module.exports = { plug: plug }
