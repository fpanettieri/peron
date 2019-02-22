'use strict';

const cfg = require('../cfg/peron');
const logger = require('../lib/logger');
const log = new logger('[core/broker]');

let bb = null;

let pending = [];
let live = [];
let interval = null;

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
}

function onCandleAnalyzed (c)
{
  candle = c;
  // for op in active
    // amend orders
}

function onBuyContract (sym, qty, px)
{
  pending.push({ id: genId(), op: 'buy', sym: sym, qty: qty, px: px, t: Date.now() });
  if (interval) { return; }
  interval = setInterval(run, cfg.broker.interval);
}

function onSellContract (sym, qty, px)
{
  pending.push({ id: genId(), op: 'sell', sym: sym, qty: qty, px: px, t: Date.now() });
  if (interval) { return; }
  interval = setInterval(run, cfg.broker.interval);
}

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}`;
}

function run ()
{

}

module.exports = { plug: plug }
