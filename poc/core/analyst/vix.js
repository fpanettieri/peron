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
  const ema_prd = cfg.analyst.ema;
  const vix_prd = cfg.analyst.vix.periods;
  if (ohlcs.length < Math.max(ema_prd, vix_prd)) { return; }

  // Moving Average
  o.ma = o.c;
  for (let i = 0; i < ema_prd - 1; i++) { o.ma += ohlcs[ohlcs.length - i - 1].c; }
  o.ma /= ema_prd;

  // Exponential Moving Average
  const ema_smooth = 2 / (ema_prd + 1);
  const ema_prev = ohlcs[ohlcs.length - 1].ema;
  o.ema = ema_prev ? (o.c - ema_prev) * ema_smooth + ema_prev : o.ma;

  // Vix
  const vix_cs = ohlcs.slice(-vix_prd).map(i => i.c);
  const vix_min = Math.min(...vix_cs);
  const vix_max = Math.max(...vix_cs);

  log.log('vix_cs', vix_cs);
  log.log('vix_min', vix_min);
  log.log('vix_max', vix_max);

  o.vix_top = (o.h - vix_min) / vix_min * 100;
  o.vix_bot = (vix_max - o.l) / vix_max * 100;

  log.log(o, '\n\n');
}

module.exports = { plug: plug };
