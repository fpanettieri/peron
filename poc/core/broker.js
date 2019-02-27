'use strict';

const cfg = require('../cfg/peron');
const orders = require('../lib/orders');
const logger = require('../lib/logger');
const log = new logger('[core/broker]');

const ORDER_PREFIX_REGEX = /^ag-/;
const LIMIT_ORDER_REGEX = /-lm$/;
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

  bb.on('OrderSynced', onOrderUpdated);
  bb.on('OrderOpened', onOrderUpdated);
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
  // TODO: updateTargets();
}

function onOrderUpdated (arr)
{
  log.log(arr);
  return;

  for (let i = 0; i < arr.length; i++) {
    const o = arr[i];

    if (!ORDER_PREFIX_REGEX.test(o.clOrdID)) {
      log.debug('Ignored non-peronist order');
      continue;
    }

    const order = orders.find(o.clOrdID);
    if (!order) {
      log.warn('unknown order', o);
      cancelOrder(o.clOrdID, 'Unknown order');

      orders.cancel(o.clOrdID);
      return;
    }
    orders.update(o);

    if (o.ordStatus == 'Canceled') {
      orders.remove(o);
      return;
    }

    const jid = o.clOrdID.substr(0, 11);
    const job = jobs.find(j => j.id == jid);
    if (!job) {
      log.warn('unknown job', jid);
      log.warn('jobs', jobs);
      log.warn('order', o);
      orders.cancel(o.clOrdID);
      return;
    }

    if (!LIMIT_ORDER_REGEX.test(o.clOrdID)) { return; }

    if (o.ordStatus == 'PartiallyFilled' || o.ordStatus == 'Filled' ) {
      updateJob(job, job.qty, o.avgPx, STATES.POSITION, Date.now());
    }

    if (o.ordStatus == 'Filled' && o.leavesQty == 0) { orders.remove(o); }
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
  // TODO: stats - reports?
  log.log('Job Created');

  jobs.push(job);
  process(job);
  if (!interval) { interval = setInterval(run, cfg.broker.speed.normal); }
}

function updateJob (job, qty, px, state, t)
{
  job.qty = qty;
  job.px = px;
  job.state = state;
  job.t = t;
  // TODO: track job change somewhere
  log.log('Job Updated');
}

function destroyJob (job)
{
  jobs.splice(jobs.findIndex(j => j.id === job.id), 1);
  // TODO: track job change somewhere
  log.log('Job Destroyed');
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
    case STATES.POSITION: proccessPosition(job); break;
    case STATES.STOP: proccessStop(job); break;
  }
}

async function proccessIntent (job)
{
  let price = job.qty > 0 ? quote.bidPrice : quote.askPrice;

  const order = await orders.limit(`${job.id}-lm`, job.sym, job.qty, price);
  if (order) {
    updateJob(job, job.qty, price, STATES.ORDER, Date.now());
    bb.emit('OrderPlaced');

    orders.debug();
  } else {
    bb.emit('OrderFailed');
  }
}

async function proccessOrder (job)
{
  const order = orders.find(`${job.id}-lm`);
  if (!order){
    log.warn('order lost?!', job);
    destroyJob(job);
    return;
  }

  if (Date.now() - job.t > cfg.broker.order.expiration) {
    cancelOrder(order.clOrdID, 'Expired');
    return;
  }

  if (job.qty > 0) {
    let price = quote.bidPrice;

    if (price > candle.bb_ma - cfg.broker.min_profit) {
      cancelOrder(order.clOrdID, 'MA Crossed');
    } else if (order.price != price){
      amendOrder(order.clOrdID, price);
    }

  } else {
    let price = quote.askPrice;

    if (price < candle.bb_ma + cfg.broker.min_profit) {
      cancelOrder(order.clOrdID, 'MA Crossed');
    } else if (order.price != price){
      amendOrder(order.clOrdID, price);
    }
  }
}

function proccessPosition (job)
{
  // updateTargets(job);
  // Micro manage orders, targeting MA
}

function proccessStop (job)
{
  // Minimize Loss, Burst interval speed
}

function cancelOrder (id, reason)
{
  orders.cancel(id, reason);
  bb.emit('OrderCanceled');
}

function amendOrder (id, price)
{
  // FIXME: check if this makes sense
  orders.amend(id, price);
  bb.emit('OrderAmended');
}

function updateTargets (o)
{
  // Based on the order fetch profit and SL targets
  // If they exist
  //   Amend quantity
  // else
  //   Create targets
}

module.exports = { plug: plug };
