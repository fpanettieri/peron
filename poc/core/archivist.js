'use strict';

const bitmex = require('../lib/bitmex');
const logger = require('../lib/logger');
const log = new logger('[core/archivist]');

let bb = null;
let db = null;

function plug (_bb, _db)
{
  log.log('plugging');
  bb = _bb;
  db = _db;

  bb.on('DownloadHistory', onDownloadHistory);
}

async function onDownloadHistory ()
{
  log.info(`downloading history`);

  const options = { method: 'GET', api: 'trade/bucketed', testnet: false };
  const params = { symbol: 'XBTUSD', binSize: '1m', count: 200, partial: false, reverse: true };
  const ticks = await bitmex.api(options, params);
  const ohlcs = ticks.map((k) => bitmex.toOhlc(k)).reverse();

  bb.emit('HistoryDownloaded', ohlcs);
}

module.exports = {
  plug: plug
}
