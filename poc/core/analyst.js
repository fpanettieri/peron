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
let analyzing = false;

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
  ohlcs = history;
  analyzeCandles();
  bb.emit('HistoryAnalyzed', ohlcs);
}

function onCandleClosed (candle)
{
  log.info(`new candle closed: ${candle.c}`);
  if (ohlcs.length > 0 && candle.t === ohlcs[ohlcs.length - 1].t) { return; }
  if (ohlcs.push(candle) > cfg.history) { ohlcs.shift(); };
  analyzeCandle(ohlcs.length - 1);
  bb.emit('CandleAnalyzed', ohlcs[ohlcs.length - 1]);
}

function analyzeCandles ()
{
  log.log('Anayzing candles!');
  if (analyzing) { return; }
  analyzing = true;
  for (let i = 0; i < ohlcs.length; i++) { analyzeCandle(i); }
  analyzing = false;
}

function analyzeCandle (idx)
{
  if (idx < cfg.bb.periods) { return; }
  if (idx > ohlcs.length) { return log.warn('analyzeCandle out of bounds'); }

  let o = ohlcs[idx];

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
