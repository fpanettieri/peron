'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const logger = require('../lib/logger');
const log = new logger('[core/broker]');

const STATES = { INTENT: 0, ORDER: 1, POSITON: 2, DONE: 3 };

let bb = null;

const jobs = [];
let interval = null;

let quote = {};
let candle = null;

function plug (_bb)
{
  bb = _bb;
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
  createJob(genId(), pos.symbol, pos.currentQty, pos.avgCostPrice, STATES.POSITION, t);
}

function onTradeContract (sym, qty, px)
{
  createJob(genId(), sym, qty, px, STATES.INTENT, Date.now());
}

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}`;
}

function createJob (id, sym, qty, px, state, t)
{
  const job = { id: id, sym: sym, qty: qty, px: px, state: state, t: t }
  jobs.push(job);
  process(job);
  if (!interval) { interval = setInterval(run, cfg.broker.interval); }
}

function run ()
{
  for (let i = jobs.length - 1; i > -1; i--){ process (jobs[i]); }
  if (jobs.length == 0) { clearInterval(interval); }
}

function process (job)
{
  switch (job.state){
    case STATES.INTENT: proccessIntent(job); break;
    case STATES.ORDER: proccessOrder(job); break;
    case STATES.POSITON: proccessPosition(job); break;
    case STATES.DONE: proccessDone(job); break;
  }
}

async function proccessIntent (job)
{
  const params = {
    symbol: job.sym,
    orderQty: job.qty,
    timeInForce: 'GoodTillCancel',
    clOrdID: job.id,
    ordType: 'Limit',
    execInst: 'ParticipateDoNotInitiate'
  }

  if (job.qty > 0) {
    params.side = 'Buy';
    params.price = quote.bidPrice;
  } else {
    params.side = 'Sell';
    params.price = quote.askPrice;
  }

  // FIXME: REMOVE THIS LINE
  params.qty = job.qty > 0 ? 1 : -1;

  const options = { method: 'POST', api: 'order', testnet: cfg.testnet };
  const rsp = await bitmex.api(options, params);

  log.log(rsp);

  if (rsp.status.code == 200){ job.state = STATES.ORDER; }
}

function proccessOrder (job)
{
  // Check if the order needs to be amended
}

function proccessPosition (job)
{
  // Check if the sell order needs to be amended
}

function proccessDone (job)
{
  // Take the job from the list
}

module.exports = { plug: plug }
