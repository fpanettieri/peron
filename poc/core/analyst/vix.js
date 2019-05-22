'use strict';

const cfg = require('../../cfg/peron');
const utils = require('../../lib/utils');
const logger = require('../../lib/logger');
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
  const ema_periods = cfg.analyst.ema;
  if (ohlcs.length < ema_periods) { return; }

  o.ma = o.c;
  for (let i = 0; i < ema_periods - 1; i++) { o.ma += ohlcs[ohlcs.length - i - 1].c; }
  o.ma /= ema_periods;

  const mul = 2 / (ema_periods + 1);
  const prev_ema = ohlcs[ohlcs.length - 1].ema;
  log.log('Prev EMA', prev_ema);

  o.ema = prev_ema ? (o.c - prev_ema) * mul + prev_ema : o.c;

  log.log(o);

  log.log('\n\n\n');
}

module.exports = { plug: plug };
