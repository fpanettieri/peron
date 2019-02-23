'use strict';

const cfg = require('../cfg/peron');
const logger = require('../lib/logger');
const log = new logger('[core/broker]');

const STATES = { PENDING: 0, OPENING: 1, OPEN: 2, CLOSING: 3, COMPLETE: 4 };

let bb = null;

let jobs = null;
let interval = null;

let quote = {};
let candle = null;

function plug (_bb)
{
  bb = _bb;

  jobs = { pending: [], live: [] };

  bb.on('QuoteUpdated', onQuoteUpdated);
  bb.on('CandleAnalyzed', onCandleAnalyzed);
  bb.on('PositionSynced', onPositionSynced);
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
}

function onPositionSynced (arr)
{
  let pos = arr.find(i => i.symbol == cfg.symbol);
  if (!pos || !pos.isOpen) { return; }

  log.log(pos);

  return
  jobs.push({ id: genId(), op: '?', sym: cfg.symbol, qty: qty, px: px, state: STATES.OPEN, t: Date.now() });
}


function onBuyContract (sym, qty, px)
{
  jobs.push({ id: genId(), op: 'buy', sym: sym, qty: qty, px: px, state: STATES.PENDING, status: t: Date.now() });
  if (interval) { return; }
  interval = setInterval(run, cfg.broker.interval);
}

function onSellContract (sym, qty, px)
{
  jobs.push({ id: genId(), op: 'sell', sym: sym, qty: qty, px: px, state: STATES.PENDING, t: Date.now() });
  if (interval) { return; }
  interval = setInterval(run, cfg.broker.interval);
}

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}`;
}

function run ()
{
  // Iterate pending jobs
    //
}

module.exports = { plug: plug }
