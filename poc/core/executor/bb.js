'use strict';

const cfg = require('../../cfg/peron');
const orders = require('../../lib/orders');
const logger = require('../../lib/logger');

const log = new logger('executor/bb');

let bb = null;
let quote = {};
let candle = null;

async function plug (_bb)
{
  bb = _bb;
}

module.exports = { plug: plug };
