'use strict';

const bitmex = require('../lib/bitmex');
const logger = require('../lib/logger');
const log = new logger('[core/archivist]');

let bb = null;
let db = null;

let balance = 0;

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
  const params = { symbol: symbol, binSize: interval, count: count, partial: false };
  const ticks = await bitmex.api(options, params);

  log.log(ticks);
}

module.exports = {
  plug: plug
}
