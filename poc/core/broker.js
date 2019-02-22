'use strict';

const cfg = require('../cfg/peron');
const logger = require('../lib/logger');
const log = new logger('[core/broker]');

let bb = null;

let pending = [];
let live = [];

let quote = {};
let candle = null;

function plug (_bb)
{
  bb = _bb;
  bb.on('QuoteUpdated', onQuoteUpdated);
  bb.on('CandleAnalyzed', onCandleAnalyzed);
  bb.on('BuyContract', onBuyContract);
  bb.on('SellContract', onSellContract);
}

function onQuoteUpdated (q)
{
  quote = q;
  log.log(q);
}

function onCandleAnalyzed (c)
{
  candle = c;
  // for op in active
    // amend orders
}

function onBuyContract (sym, qty, _candle)
{
  candle = _candle;
  pending.push({ id: genId(), op: 'buy', sym: sym, qty: qty, px: px, t: Date.now() });
}

function onSellContract (sym, qty, _candle)
{
  candle = _candle;
  pending.push({ id: genId(), op: 'sell', sym: sym, qty: qty, px: px, t: Date.now() });
}

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}`;
}

module.exports = { plug: plug }
