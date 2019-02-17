'use strict';

const bitmex = require('../lib/bitmex');
const utils = require('../lib/utils');
const logger = require('../lib/logger');
const log = new logger('[core/analyst]');

const CANDLE_STEP = utils.intervalToMs('1m');
const CANDLE_LIMIT = 200;

let bb = null;
let db = null;

let ohlcs = [];
let analyzing = false;
let offset = 0;

function plug (_bb, _db)
{
  log.log('plugging');
  bb = _bb;
  db = _db;
  bb.on('HistoryDownloaded', onHistoryDownloaded);
  bb.on('CandleClosed', onCandleClosed);
}

async function onHistoryDownloaded (history)
{
  log.info(`caching history`);
  ohlcs = history;
  offset = 0;
  analyzeCandles();
}

async function onCandleClosed (candle)
{
  log.info(`on candle closed`);
  if (ohlcs.length > 0 && candle.t === ohlcs[ohlcs.length - 1].t) { return; }
  if (ohlcs.push(candle) > CANDLE_LIMIT) { ohlcs.shift(); };
  analyzeCandles();
}

function analyzeCandles ()
{
  log.log('Anayzing candles!')
  if (analyzing) { return; }
  analyzing = true;

  for (let i = 1; i < ohlcs.length; i++) {
    console.log(ohlcs[i].t - ohlcs[i - 1].t);
    // calculate BB 50
  }

  analyzing = false;
}

module.exports = {
  plug: plug
}
