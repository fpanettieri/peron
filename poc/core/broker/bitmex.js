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

  bb.on('QuoteSynced', onQuoteUpdated);
  bb.on('QuoteUpdated', onQuoteUpdated);
  bb.on('QuoteOpened', onQuoteUpdated);

  bb.on('CandleAnalyzed', onCandleAnalyzed);
  bb.on('PositionSynced', onPositionSynced);

  bb.on('OrderSynced', onOrderUpdated);
  bb.on('OrderOpened', onOrderUpdated);
  bb.on('OrderUpdated', onOrderUpdated);

  bb.on('TradeContract', onTradeContract);
}

function onQuoteUpdated (arr)
{
  quote = arr[arr.length - 1];
}

function onCandleAnalyzed (c)
{
  candle = c;
}

async function onPositionSynced (arr)
{
  const pos = arr.find(i => i.symbol == cfg.symbol);
  if (!pos || !pos.isOpen) { return; }

  const t = (new Date(pos.openingTimestamp)).getTime();
  const id = genId();

  log.debug('################# pre create job');

  const job = createJob(id, pos.symbol, pos.currentQty, pos.avgCostPrice, STATES.STOP, t);
  await updateTargets(job, pos.symbol, pos.currentQty, pos.avgCostPrice);

  log.debug('soft sl:', job.sl);

  log.debug('################# post create job');
}

function onTradeContract (sym, qty, px)
{
  // FIXME: check if this limit makes sense V
  if (jobs.length >= cfg.broker.max_jobs) { log.log('max amount of jobs'); return; }
  const job = createJob(genId(), sym, qty, px, STATES.INTENT, Date.now());
  process(job);
}

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}`;
}

function createJob (id, sym, qty, px, state, t)
{
  const job = { id: id, sym: sym, qty: qty, px: px, state: state, t: t, created_at: Date.now() };
  // TODO: stats - reports?
  log.debug('Job Created');
  jobs.push(job);
  if (!interval) { interval = setInterval(run, cfg.broker.speed.normal); }
  return job;
}

function updateJob (id, changes)
{
  log.debug('Job Updated');
  const idx = jobs.findIndex(j => j.id == id);
  jobs[idx] = {...jobs[idx], changes};
  return jobs[idx];
}

function destroyJob (job)
{
  log.debug('Job Destroyed');
  jobs.splice(jobs.findIndex(j => j.id === job.id), 1);
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
    case STATES.POSITION: proccessPosition(job); break;
    case STATES.STOP: proccessStop(job); break;
  }
}

async function proccessIntent (job)
{
  log.debug('proccessIntent');

  let price = job.qty > 0 ? quote.bidPrice : quote.askPrice;

  const order = await orders.limit(`${job.id}-lm`, job.sym, job.qty, price);
  if (order) {
    updateJob(job.id, {state: STATES.ORDER});
    bb.emit('OrderPlaced');
  } else {
    bb.emit('OrderFailed');
  }
}

async function proccessOrder (job)
{
  log.debug('proccessOrder');


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
  log.debug('onOrderUpdated');

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
      burstSpeed(false);
      continue;
    }

    if (o.ordStatus == 'PartiallyFilled' || o.ordStatus == 'Filled') {
      updateTargets(job, job.sym, order.leavesQty, order.avgPx);
      updateJob(job.id, {state: STATES.POSITION});
    }

    if (o.ordStatus == 'Filled') { orders.remove(o); }
  }
}

function proccessPosition (job)
{
  log.debug('proccessPosition');

  proccessOrder(job);

  const profit_order = orders.find(`${job.id}-tp`);
  if (!profit_order){
    log.error('order lost?!', job);
    destroyJob(job);
    return;
  }

  let price = safePrice(candle.bb_ma);
  log.debug('target price', price);

  if (profit_order.price != price){
    amendOrder(profit_order.clOrdID, {price: price});
  }

  if (job.qty > 0 && quote.askPrice < job.sl) {
    updateJob(job.id, {state: STATES.STOP});
    burstSpeed(true);

  } else if (job.qty < 0 && quote.bidPrice > job.sl) {
    updateJob(job.id, {state: STATES.STOP});
    burstSpeed(true);
  }
}

function proccessStop (job)
{
  log.debug('proccessStop');

  proccessOrder(job);

  const profit_order = orders.find(`${job.id}-tp`);
  if (!profit_order){
    log.error('order lost?!', job);
    destroyJob(job);
    return;
  }

  const price = job.qty > 0 ? quote.askPrice : quote.bidPrice;
  updateJob(job.id, {price: price});
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

async function updateTargets (job, sym, qty, px)
{
  log.info('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ updateTargets');
  log.debug('px', px);

  job.sl = safePrice(px * (1 + -Math.sign(qty) * cfg.broker.sl.hard));
  log.debug('soft sl_px', job.sl);

  const sl_px = safePrice(px * (1 + -Math.sign(qty) * cfg.broker.sl.hard));
  log.debug('hardsl_px', sl_px);

  let sl = orders.find(`${job.id}-sl`);
  if (!sl) {
    sl = await orders.stop(`${job.id}-sl`, sym, -qty, sl_px);
  } else {
    sl = await orders.amend(`${job.id}-sl`, {orderQty: -qty, stopPx: sl_px});
  }

  log.debug('candle', candle);

  const tp_px = safePrice(candle ? candle.bb_ma : px * (1 + Math.sign(qty) * cfg.broker.sl.hard));
  log.debug('tp_px', tp_px);

  let tp = orders.find(`${job.id}-tp`);
  if (!tp) {
    tp = await orders.profit(`${job.id}-tp`, sym, -qty, tp_px);
  } else {
    tp = await orders.amend(`${job.id}-tp`, {orderQty: -qty, price: tp_px});
  }

  log.warn('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ updateTargets');
}

function burstSpeed (b)
{
  const speed = b ? cfg.broker.speed.burst : cfg.broker.speed.normal;
  clearInterval(interval);
  interval = setInterval(run, speed);
}

function safePrice (px)
{
  return Math.round(px * 2) / 2;
}

module.exports = { plug: plug };
