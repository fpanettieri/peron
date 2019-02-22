'use strict';

const cfg = require('../cfg/peron');
const logger = require('../lib/logger');
const log = new logger('[core/broker]');

let bb = null;

const pending = [];
const quote = {};

function plug (_bb)
{
  bb = _bb;
  bb.on('QuoteUpdated', onQuoteUpdated);
  bb.on('BuyContract', onBuyContract);
  bb.on('SellContract', onSellContract);
}

function onQuoteUpdated (q)
{
  quote = q;
}

function onBuyContract (s, q)
{
  pending.push({ id: genId(), op: 'buy', s: s, q: q, t: Date.now() });
}

function onSellContract (s, q)
{
  pending.push({ id: genId(), op: 'sell', s: s, q: q, t: Date.now() });
}

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}`;
}

module.exports = { plug: plug }
