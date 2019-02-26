'use strict';

const cfg = require('../cfg/peron');
const orders = require('../lib/orders');
const logger = require('../lib/logger');
const log = new logger('[core/broker]');

const STATES = { INTENT: 0, ORDER: 1, POSITION: 2, STOP: 3 };

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
  bb.on('OrderUpdated', onOrderUpdated);
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

function onOrderUpdated (o)
{
  log.log('======================================================================');
  log.log('\n\n\n', o, '\n\n\n');

  const order = orders.find(o.clOrdID);
  const jid = o.clOrdID.substr(0, 11);
  const job = jobs.find(j => j.id == jid);

  if (!order || !job) {
    log.log('unknown order!');
    log.log('======================================================================');
    return orders.discard(o.orderID);
  }
  orders.update(o);

  if (o.ordStatus == 'Filled' && o.leavesQty == 0) {
    job.price = o.avgPx;
    job.state = STATES.FILLED;
  }
}

function onTradeContract (sym, qty, px)
{
  if (jobs.length >= cfg.broker.max_jobs) { log.log('max amount of jobs'); return; }
  createJob(genId(), sym, qty, px, STATES.INTENT, Date.now());
}

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}`;
}

function createJob (id, sym, qty, px, state, t)
{
  const job = { id: id, sym: sym, qty: qty, px: px, state: state, t: t };
  jobs.push(job);
  process(job);
  if (!interval) { interval = setInterval(run, cfg.broker.interval); }
}

function run ()
{
  for (let i = jobs.length - 1; i > -1; i--){ process (jobs[i]); }
  if (jobs.length == 0) { clearInterval(interval); }
}

// TODO: extract this to it's own file?
function process (job)
{
  switch (job.state){
    case STATES.INTENT: proccessIntent(job); break;
    case STATES.ORDER: proccessOrder(job); break;
    case STATES.FILLED: proccessFilled(job); break;
    case STATES.POSITION: proccessPosition(job); break;
    case STATES.DONE: proccessDone(job); break;
  }
}

async function proccessIntent (job)
{
  let price = job.qty > 0 ? quote.bidPrice : quote.askPrice;
  const order = orders.create(`${job.id}-in`, job.sym, job.qty, price);
  if (order) {
    job.state = STATES.ORDER;
    bb.emit('OrderPlaced', job.sym, job.qty, price, job.id);
  } else {
    bb.emit('OrderFailed', job.sym, job.qty, price, job.id);
  }
}

async function proccessOrder (job)
{
  const order = orders.find(`${job.id}-in`);

  if (job.qty > 0) {
    let price = quote.bidPrice;

    if (price > candle.bb_ma - cfg.broker.min_profit) {
      orders.cancel(order.clOrdID);
      bb.emit('OrderCanceled', job.sym, job.qty, price, job.id);

    } else if (order.price != price){
      orders.amend(order.clOrdID, price);
      bb.emit('OrderAmended', job.sym, job.qty, price, job.id);

    } else {
      log.log('same price!');
    }

  } else {
    let price = quote.askPrice;

    if (price < candle.bb_ma + cfg.broker.min_profit) {
      orders.cancel(order.clOrdID);
      bb.emit('OrderCanceled', job.sym, job.qty, price, job.id);

    } else if (order.price != price){
      orders.amend(order.clOrdID, price);
      bb.emit('OrderAmended', job.sym, job.qty, price, job.id);

    } else {
      log.log('same price!');
    }
  }
}

function proccessFilled (job)
{
  // Create sell order
  // Create stop-loss order
}

function proccessPosition (job)
{
  // Check if the sell order needs to be amended
}

function proccessDone (job)
{
  // Take the job from the list & log
}

module.exports = { plug: plug };
