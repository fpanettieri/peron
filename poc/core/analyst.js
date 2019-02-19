'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const utils = require('../lib/utils');
const logger = require('../lib/logger');
const log = new logger('[core/analyst]');

const CANDLE_STEP = utils.intervalToMs(cfg.timeframe);

let bb = null;
let ohlcs = [];

function plug (_bb)
{
  log.log('plugging');
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
  if (c.t == ohlcs[ohlcs.length - 1].t) { return; }

  for (let i = 1; i < ohlcs.length; i++) {
    const delta = ohlcs[i].t - ohlcs[i - 1].t;
    if (delta > 60 * 1000) { log.fatal(`invalid delta between candles: ${delta}`); }
  }

  analyze(c);
  if (ohlcs.push(c) > cfg.history) { ohlcs.shift(); };
  bb.emit('CandleAnalyzed', c);
}

function analyze (o)
{
  if (ohlcs.length < cfg.bb.periods) { return; }

  o.bb_ma = o.c;
  for (let i = 0; i < cfg.bb.periods - 1; i++) { o.bb_ma += ohlcs[ohlcs.length - i - 1].c; }
  o.bb_ma /= cfg.bb.periods;

  o.bb_dev = Math.pow(o.c - o.bb_ma, 2);
  for (let i = 0; i < cfg.bb.periods - 1; i++) { o.bb_dev += Math.pow(ohlcs[ohlcs.length - i - 1].c - o.bb_ma, 2); }
  o.bb_dev = Math.sqrt(o.bb_dev / cfg.bb.periods);

  o.bb_lower = o.bb_ma - o.bb_dev * cfg.bb.mult;
  o.bb_upper = o.bb_ma + o.bb_dev * cfg.bb.mult;
}

module.exports = { plug: plug }
