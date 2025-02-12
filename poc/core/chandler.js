'use strict';

const utils = include('lib/utils');
const logger = include('lib/logger');
const log = new logger('core/chandler');

const CLOSE_OFFSET = cfg.chandler.offset;
const CANDLE_STEP = utils.intervalToMs(cfg.timeframe);
const MIN_STEP = utils.intervalToMs('5s');
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

  bb.on('TradeSynced', onTradeReceived);
  bb.on('TradeOpened', onTradeReceived);
  bb.on('TradeUpdated', onTradeReceived);

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

  bb.emit('SendAdapterMsg', 'unsubscribe', [`tradeBin${cfg.timeframe}:${cfg.symbol}`]);
  bb.emit('CandleClosed', c);

  state = STATES.CANDLE;
}

function onTradeReceived (arr)
{
  for (let i = 0; i < arr.length; i++) {
    const t = arr[i];

    if (candle.o == null) { candle.o = t.price; }
    if (t.price > candle.h) { candle.h = t.price; }
    if (t.price < candle.l) { candle.l = t.price; }
    candle.c = t.price;
    candle.v += t.foreignNotional;
  }
}

function closeCandle ()
{
  setTimeout(closeCandle, getTimeout());

  // Fix empty candles
  if (candle.v == 0) { candle.c = candle.h = candle.l = candle.o; }
  if (state == STATES.CANDLE) { bb.emit('CandleClosed', candle); }

  let close = candle.c;
  resetCandle();
  candle.o = close;
}

function getTimeout ()
{
  let timeout = CANDLE_STEP - (Date.now() % CANDLE_STEP) + CLOSE_OFFSET;
  if (timeout < MIN_STEP) { timeout += CANDLE_STEP; }
  return timeout;
}

function resetCandle ()
{
  candle = {o: null, h: Number.MIN_SAFE_INTEGER, l: Number.MAX_SAFE_INTEGER, c: null, v: 0, t: (Math.round(Date.now() / CANDLE_STEP) + 1) * CANDLE_STEP};
}

module.exports = { plug: plug };
