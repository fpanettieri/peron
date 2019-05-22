'use strict';

const cfg = require('../cfg/peron');
const utils = require('../lib/utils');
const logger = require('../lib/logger');
const log = new logger('analyst/bb');

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
  if (ohlcs.length < cfg.analyst.bb.periods) { return; }

  o.bb_ma = o.c;
  for (let i = 0; i < cfg.analyst.bb.periods - 1; i++) { o.bb_ma += ohlcs[ohlcs.length - i - 1].c; }
  o.bb_ma /= cfg.analyst.bb.periods;

  o.bb_dev = Math.pow(o.c - o.bb_ma, 2);
  for (let i = 0; i < cfg.analyst.bb.periods - 1; i++) { o.bb_dev += Math.pow(ohlcs[ohlcs.length - i - 1].c - o.bb_ma, 2); }
  o.bb_dev = Math.sqrt(o.bb_dev / cfg.analyst.bb.periods);

  o.bb_lower = o.bb_ma - o.bb_dev * cfg.analyst.bb.mult;
  o.bb_upper = o.bb_ma + o.bb_dev * cfg.analyst.bb.mult;
}

module.exports = { plug: plug };
