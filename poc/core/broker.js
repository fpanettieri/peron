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
  bb.on('TradeContract', onTradeContract);
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
  const t = (new Date(pos.openingTimestamp)).getTime();
  jobs.push({ id: genId(), sym: pos.symbol, qty: pos.currentQty, px: pos.avgCostPrice, state: STATES.OPEN, t: t });
}

function onTradeContract (sym, qty, px)
{
  jobs.push({ id: genId(), sym: sym, qty: qty, px: px, state: STATES.PENDING, t: Date.now() });
  if (interval) { return; }
  interval = setInterval(run, cfg.broker.interval);
}

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}`;
}

function run ()
{
  for (let i = 0; i < jobs.length; i++){
    const j = jobs[i];
    // do the job!
    log.log(j);
  }
  if (jobs.length == 0) { clearInterval(interval); }
}

module.exports = { plug: plug }
