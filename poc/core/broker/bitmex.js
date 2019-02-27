'use strict';

const cfg = require('../../cfg/peron');
const orders = require('../../lib/orders');
const logger = require('../../lib/logger');
const log = new logger('[broker/bitmex]');

const ORDER_PREFIX_REGEX = /^ag-/;
const LIMIT_ORDER_REGEX = /-lm$/;
const PROFIT_ORDER_REGEX = /-tp$/;
const STOP_ORDER_REGEX = /-sl$/;

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
  bb.on('PositionUpdated', onPositionUpdated);

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
}

function onPositionUpdated (p)
{
  log.debug(p);
}

function onTradeContract (sym, qty, px)
{
  // FIXME: check if this limit makes sense V
  if (jobs.length >= cfg.broker.max_jobs) { log.log('max amount of jobs'); return; }
  createJob(genId(), sym, qty, px, STATES.INTENT, Date.now());
}

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}`;
}

function createJob (id, sym, qty, px, state, t)
{
  // TODO: add created at
  const job = { id: id, sym: sym, qty: qty, px: px, state: state, t: t, created_at: Date.now() };
  // TODO: stats - reports?
  log.debug('Job Created');

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
  log.debug('Job Updated');
}

function destroyJob (job)
{
  jobs.splice(jobs.findIndex(j => j.id === job.id), 1);
  // TODO: track job change somewhere
  log.debug('Job Destroyed');
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
  } else {
    bb.emit('OrderFailed');
  }
}

async function proccessOrder (job)
{
  const order = orders.find(`${job.id}-lm`);
  if (!order){
    if (job.state == STATES.ORDER){
      log.error('order lost?!', job);
      destroyJob(job);
    }
    return;
  }

  if (Date.now() - job.created_at > cfg.broker.order.expiration) {
    cancelOrder(order.clOrdID, 'Expired');
    return;
  }

  if (job.qty > 0) {
    let price = quote.bidPrice;

    if (price > candle.bb_ma - cfg.broker.min_profit) {
      cancelOrder(order.clOrdID, 'MA Crossed');
    } else if (order.price != price){
      amendOrder(order.clOrdID, {price: price});
    }

  } else {
    let price = quote.askPrice;

    if (price < candle.bb_ma + cfg.broker.min_profit) {
      cancelOrder(order.clOrdID, 'MA Crossed');
    } else if (order.price != price){
      amendOrder(order.clOrdID, {price: price});
    }
  }
}

function onOrderUpdated (arr)
{
  for (let i = 0; i < arr.length; i++) {
    const o = arr[i];

    if (!ORDER_PREFIX_REGEX.test(o.clOrdID)) {
      log.debug('Ignored non-peronist order');
      continue;
    }

    const order = orders.find(o.clOrdID);
    if (!order) {
      // FIXME: remove this log
      log.error('Unknown order');
      cancelOrder(o.clOrdID, 'Unknown Order');
      continue;
    }
    orders.update(o);

    if (o.ordStatus == 'Canceled') {
      orders.remove(o);
      continue;
    }

    const jid = o.clOrdID.substr(0, 11);
    const job = jobs.find(j => j.id == jid);
    if (!job) {
      // FIXME: remove this log
      log.error('unknown job', job, o);
      orders.cancel(o.clOrdID);
      continue;
    }

    // Stop Loss or Take Profit Filled
    if (!LIMIT_ORDER_REGEX.test(o.clOrdID) && o.ordStatus == 'Filled') {
      orders.cancel_all(order.symbol);
      continue;
    }

    if (o.ordStatus == 'PartiallyFilled' || o.ordStatus == 'Filled') {
      updateTargets(order);
      updateJob(job, job.qty, order.avgPx, STATES.POSITION, Date.now());
    }

    if (o.ordStatus == 'Filled') { orders.remove(o); }
  }
}

function proccessPosition (job)
{
  proccessOrder(job);

  const profit_order = orders.find(`${job.id}-tp`);
  if (!profit_order){
    log.error('order lost?!', job);
    destroyJob(job);
    return;
  }

  // TODO: micro manage long
  let price = Math.round(candle.bb_ma * 2) / 2;
  log.log('target price', price);

  if (profit_order.price != price){
    amendOrder(profit_order.clOrdID, {price: price});
  }

  // TODO: check if the soft SL is triggered!
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

function amendOrder (id, params)
{
  orders.amend(id, params);
  bb.emit('OrderAmended');
}

function updateTargets (o)
{
  log.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ updateTargets');
  log.log(o);
  //
  // Based on the order fetch profit and SL targets
  // If they exist
  //   Amend quantity
  // else
  //   Create targets
}

module.exports = { plug: plug };
