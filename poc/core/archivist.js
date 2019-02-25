'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const logger = require('../lib/logger');
const log = new logger('[core/archivist]');

let bb = null;

function plug (_bb)
{
  bb = _bb;
  bb.on('DownloadHistory', onDownloadHistory);
}

async function onDownloadHistory ()
{
  try {
    const options = { method: 'GET', api: 'trade/bucketed', testnet: cfg.testnet };
    const params = { symbol: cfg.symbol, binSize: cfg.timeframe, count: cfg.history, partial: false, reverse: true };
    const rsp = await bitmex.api(options, params);
    const ohlcs = rsp.body.map((k) => bitmex.toOhlc(k)).reverse();
    bb.emit('HistoryDownloaded', ohlcs);
  } catch(err) {
    log.error(err);
  }
}

module.exports = { plug: plug };
