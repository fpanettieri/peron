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

function onBuyContract (sym, qty, px)
{
  pending.push({ i: genId(), o: 'buy', s: sym, q: qty, p: px, t: Date.now() });

}

function onSellContract (sym, qty, px)
{
  pending.push({ i: genId(), o: 'sell', s: sym, q: qty, p: px, t: Date.now() });
}

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}`;
}

module.exports = { plug: plug }
