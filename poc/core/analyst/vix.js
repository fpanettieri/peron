'use strict';

const cfg = require('../cfg/peron');
const utils = require('../lib/utils');
const logger = require('../lib/logger');
const log = new logger('analyst/vix');

const CANDLE_STEP = utils.intervalToMs(cfg.timeframe);

let bb = null;
let ohlcs = [];

function plug (_bb)
{
  bb = _bb;
  bb.on('HistoryDownloaded', onHistoryDownloaded);
  bb.on('CandleClosed', onCandleClosed);
}

function onHistoryDownloaded (history)
{
  ohlcs = [];
  for (let i = 0; i < history.length; i++) {
    let o = history[i];
    analyze(o);
    ohlcs.push(o);
  }
  bb.emit('HistoryAnalyzed');
}

function onCandleClosed (c)
{
  if (c.t == ohlcs[ohlcs.length - 1].t) {
    log.warn('this should never happen, it should be filtered by the chandler');
    return;
  }

  for (let i = 1; i < ohlcs.length; i++) {
    const delta = ohlcs[i].t - ohlcs[i - 1].t;
    if (delta > CANDLE_STEP) { log.fatal(`invalid delta between candles: ${delta}`); }
  }

  analyze(c);
  if (ohlcs.push(c) > cfg.analyst.history) { ohlcs.shift(); }
  bb.emit('CandleAnalyzed', c);
}

function analyze (o)
{
  log.log('analyzing:', o);

  const periods = cfg.analyst.bb.periods;
  log.log('periods', periods);

  if (ohlcs.length < periods) { return; }

  o.sma = o.c;
  for (let i = 0; i < periods - 1; i++) { o.sma += ohlcs[ohlcs.length - i - 1].c; }
  o.sma /= periods;
  log.log('sma', o.sma);

  const ema_mul = 2 / (periods + 1);
  log.log('EMA Mul', ema_mul);
}

module.exports = { plug: plug };
