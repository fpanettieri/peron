'use strict';

const cfg = require('../cfg/peron.json');
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
  log.info(`on candle closed`);
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
  for (let i = 1; i < ohlcs.length; i++) { analyzeCandle(i); }
  analyzing = false;
}

function analyzeCandle (idx)
{
  if (idx > ohlcs.length) { return log.warn('analyzeCandle out of bounds'); }
  if (idx < cfg.bb.periods) { return log.warn(`${idx} < ${cfg.bb.periods}`); }

  let o = ohlcs[idx];
  o.bb_ma = 0;

  for (let i = 0; i < cfg.bb.periods; i++) {
    o.bb_ma += ohlcs[idx - i].c;
  }

  o.bb_lower = 0.24;
  o.bb_upper = 240;
}

module.exports = {
  plug: plug
}
