'use strict';

const logger = require('../lib/logger');
const log = new logger('[core/auditor]');

let bb = null;

function plug (_bb)
{
  bb = _bb;

  bb.on('CandleClosed', noop);
  bb.on('BuyContract', noop);
  bb.on('SellContract', noop);
}

function noop ()
{

}

module.exports = { plug: plug };
