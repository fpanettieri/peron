'use strict';

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

function onDownloadHistory ()
{
  log.info(`downloading history`);
  balance = b;
}

module.exports = {
  plug: plug
}
