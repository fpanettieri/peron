'use strict';

const cfg = require('../cfg/peron');

const logger = require('../lib/logger');
const log = new logger('[core/trader]');

let bb = null;

function plug (_bb)
{
  bb = _bb;
}

module.exports = { plug: plug }
