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
  log.info(`caching history`);
  analyze(c);
  bb.emit('LiveCandleAnalyzed', c);
}

function onCandleClosed (candle)
{
  log.info(`new candle: ${candle.c}`);
  if (ohlcs.length > 0 && candle.t === ohlcs[ohlcs.length - 1].t) { return; }
  if (ohlcs.push(candle) > cfg.history) { ohlcs.shift(); };
  analyze(ohlcs.length - 1);
  bb.emit('CandleAnalyzed', ohlcs[ohlcs.length - 1]);
}

function analyze (o)
{
  if (ohlcs.length < cfg.history) { return; }

  o.bb_ma = 0;
  for (let i = 0; i < cfg.bb.periods; i++) { o.bb_ma += ohlcs[idx - i].c; }
  o.bb_ma /= cfg.bb.periods;

  o.bb_dev = 0;
  for (let i = 0; i < cfg.bb.periods; i++) { o.bb_dev += Math.pow(ohlcs[idx - i].c - o.bb_ma, 2); }
  o.bb_dev = Math.sqrt(o.bb_dev / cfg.bb.periods);

  o.bb_lower = o.bb_ma - o.bb_dev * cfg.bb.mult;
  o.bb_upper = o.bb_ma + o.bb_dev * cfg.bb.mult;
}

module.exports = {
  plug: plug
}
