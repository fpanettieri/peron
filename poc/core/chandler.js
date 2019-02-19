'use strict';

const cfg = require('../cfg/peron');
const utils = require('../lib/utils');
const logger = require('../lib/logger');
const log = new logger('[core/chandler]');

let bb = null;
let db = null;

function plug (_bb, _db)
{
  log.log('plugging');
  bb = _bb;
  db = _db;
}


module.exports = {
  plug: plug
}
