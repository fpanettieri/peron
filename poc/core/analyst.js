'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const utils = require('../lib/utils');
const logger = require('../lib/logger');
const log = new logger('[core/analyst]');

const CANDLE_STEP = utils.intervalToMs(cfg.timeframe);

let bb = null;
let db = null;

let ohlcs = [];

function plug (_bb, _db)
{
  log.log('plugging');
  bb = _bb;
  db = _db;
  bb.on('HistoryDownloaded', onHistoryDownloaded);
  bb.on('CandleClosed', onCandleClosed);
}

function onHistoryDownloaded (history)
{
  log.info(`caching history`);
  ohlcs = [];
  for (let i = 0; i <  history.length; i++) {
    let o = history[i];
    analyze(o);
    ohlcs.push(o);
  }
  bb.emit('HistoryAnalyzed');
}

function onCandleUpdated (c)
{
  analyze(c);
  bb.emit('LiveCandleAnalyzed', c);
}

function onCandleClosed (c)
{
  log.info(`new candle: ${c.c}`);
  analyze(c);
  if (ohlcs.push(c) > cfg.history) { ohlcs.shift(); };
  bb.emit('CandleAnalyzed', ohlcs[ohlcs.length - 1]);
}

function analyze (o)
{
  if (ohlcs.length < cfg.history) { return; }

  o.bb_ma = o.c;
  for (let i = 0; i < cfg.bb.periods - 1; i++) { o.bb_ma += ohlcs[idx - i].c; }
  o.bb_ma /= cfg.bb.periods;

  o.bb_dev = o.c - o.bb_ma;
  for (let i = 0; i < cfg.bb.periods - 1; i++) { o.bb_dev += Math.pow(ohlcs[idx - i].c - o.bb_ma, 2); }
  o.bb_dev = Math.sqrt(o.bb_dev / cfg.bb.periods);

  o.bb_lower = o.bb_ma - o.bb_dev * cfg.bb.mult;
  o.bb_upper = o.bb_ma + o.bb_dev * cfg.bb.mult;
}

module.exports = {
  plug: plug
}
