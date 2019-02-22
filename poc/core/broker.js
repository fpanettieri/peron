'use strict';

const cfg = require('../cfg/peron');
const logger = require('../lib/logger');
const log = new logger('[core/broker]');

let bb = null;

function plug (_bb)
{
  bb = _bb;
  bb.on('BuyContract', onBuyContract);
  bb.on('SellContract', onSellContract);
}

function onBuyContract (s, q)
{
  // Try to buy 'q' amount of 's'
}

function onSellContract (s, q)
{
  // Try to buy 'q' amount of 's'
}

module.exports = { plug: plug }
