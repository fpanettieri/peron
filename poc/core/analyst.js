'use strict';

const bitmex = require('../lib/bitmex');
const utils = require('../lib/utils');
const logger = require('../lib/logger');
const log = new logger('[core/analyst]');

const CANDLE_STEP = utils.intervalToMs('1m');
const CANDLE_LIMIT = 200;

const BB_PERIODS = 24;
const BB_MULT = 2;

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
  log.log(ohlcs[ohlcs.length - 1]);
  bb.emit('HistoryAnalyzed', ohlcs);
}

function onCandleClosed (candle)
{
  log.info(`on candle closed`);
  if (ohlcs.length > 0 && candle.t === ohlcs[ohlcs.length - 1].t) { return; }
  if (ohlcs.push(candle) > CANDLE_LIMIT) { ohlcs.shift(); };
  analyzeCandle(ohlcs.length - 1);
  log.log(candle);
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
  let o = ohlcs[idx];
  o.bb_ma = 3;
  o.bb_lower = 0.2;
  o.bb_upper = 24;
}

module.exports = {
  plug: plug
}
