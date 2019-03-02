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

async function plug (_bb)
{
  bb = _bb;

  bb.on('QuoteSynced', onQuoteUpdated);
  bb.on('QuoteUpdated', onQuoteUpdated);
  bb.on('QuoteOpened', onQuoteUpdated);

  bb.on('CandleAnalyzed', onCandleAnalyzed);
  bb.on('PositionSynced', onPositionSynced);

  bb.on('OrderSynced', onOrderSynced);
  bb.on('OrderOpened', onOrderOpened);
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

  const job = createJob(id, pos.symbol, pos.currentQty, pos.avgCostPrice, STATES.STOP, t);
  await updateTargets(job, pos.symbol, pos.currentQty, pos.avgCostPrice);
  burstSpeed(true);
}

function onOrderSynced (arr)
{
  for (let i = 0; i < arr.length; i++) {
    const o = arr[i];

    if (!ORDER_PREFIX_REGEX.test(o.clOrdID)) {
      log.log('Ignored non-peronist order');
      continue;
    }

    orders.discard(arr[i].orderID);
  }
}

function onOrderOpened (arr)
{
  for (let i = 0; i < arr.length; i++) { orders.add(arr[i]); }
}

async function onOrderUpdated (arr)
{
  log.warn('>>>>> onOrderUpdated.start');

  for (let i = 0; i < arr.length; i++) {
    const o = arr[i];

    if (!ORDER_PREFIX_REGEX.test(o.clOrdID)) {
      log.log('Ignored non-peronist order');
      continue;
    }

    let order = orders.find(o.clOrdID);
    if (!order) {
      log.debug('missing order', o);
      if (o.ordStatus != 'Canceled') { cancelOrder(o.clOrdID, 'Unknown Order'); }
      continue;
    }
    order = orders.update(o);

    if (order.ordStatus == 'Canceled') {
      orders.remove(order);
      continue;
    }

    const jid = order.clOrdID.substr(0, 11);
    const job = jobs.find(j => j.id == jid);
    if (!job) {
      // FIXME: remove this log
      log.error('unknown job', job, order);
      orders.cancel(order.clOrdID);
      continue;
    }

    updateJob(job.id, {locked: true});

    const is_limit = LIMIT_ORDER_REGEX.test(order.clOrdID);
    if (is_limit && (order.ordStatus == 'PartiallyFilled' || order.ordStatus == 'Filled')) {
      orders.remove(order);
      updateJob(job.id, {state: STATES.POSITION});
      let direction = job.qty > 0 ? 1 : -1;
      await updateTargets(job, job.sym, direction * (order.orderQty - order.leavesQty), order.avgPx);

    } else if (!is_limit && order.ordStatus == 'Filled') {
      orders.remove(order);
      destroyJob(job);
      orders.cancel_all(order.symbol);
      burstSpeed(false);
    }
    updateJob(job.id, {locked: false});
  }

  log.warn('>>>>> onOrderUpdated.end');
}

function onTradeContract (sym, qty, px)
{
  // FIXME: check if this limit makes sense V
  // (2019-03-1) It doesn't, but i'll keep it for now
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
  // TODO: stats - reports?

  const job = { id: id, sym: sym, qty: qty, px: px, state: state, t: t, created_at: Date.now(), locked: false};
  jobs.push(job);

  if (!interval) { burstSpeed(false); }
  return job;
}

function updateJob (id, changes)
{
  // TODO: stats - reports?

  const idx = jobs.findIndex(j => j.id == id);
  jobs[idx] = {...jobs[idx], ...changes};
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

  if (jobs.length == 0) {
    clearInterval(interval);
    interval = null;
  }
}

async function process (job)
{
  if (!quote){ return; }
  if (job.locked) { return; }

  log.debug(`process.lock`);
  updateJob(job.id, {locked: true});

  switch (job.state){
    case STATES.INTENT: await proccessIntent(job); break;
    case STATES.ORDER: await proccessOrder(job); break;
    case STATES.POSITION: await proccessPosition(job); break;
    case STATES.STOP: await proccessStop(job); break;
  }

  updateJob(job.id, {locked: false});
  log.debug(`process.unlock`);
}

async function proccessIntent (job)
{
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
  const order = orders.find(`${job.id}-lm`);
  if (!order){
    if (job.state == STATES.ORDER){ destroyJob(job); }
    return;
  }

  if (Date.now() - job.created_at > cfg.broker.order.expires) {
    await cancelOrder(order.clOrdID, 'Expired');
    return;
  }

  let price = job.qty > 0 ? quote.bidPrice : quote.askPrice;
  if (job.qty > 0) {
    if (price > candle.bb_ma - cfg.broker.min_profit) {
      await cancelOrder(order.clOrdID, 'MA Crossed');
    } else if (order.price != price){
      await amendOrder(order.clOrdID, {price: price});
    }

  } else {
    if (price < candle.bb_ma + cfg.broker.min_profit) {
      await cancelOrder(order.clOrdID, 'MA Crossed');
    } else if (order.price != price){
      await amendOrder(order.clOrdID, {price: price});
    }
  }
}

async function proccessPosition (job)
{
  if (!candle){ return; }
  proccessOrder(job);

  const profit_order = orders.find(`${job.id}-tp`);
  if (!profit_order){
    log.error('proccessPosition', 'profit order not found!');
    destroyJob(job);
    return;
  }

  let price = safePrice(candle.bb_ma);
  if (profit_order.price != price){
    await amendOrder(profit_order.clOrdID, {price: price});
  }

  if (job.qty > 0 && quote.askPrice < job.sl) {
    updateJob(job.id, {state: STATES.STOP});
    burstSpeed(true);

  } else if (job.qty < 0 && quote.bidPrice > job.sl) {
    updateJob(job.id, {state: STATES.STOP});
    burstSpeed(true);
  }
}

async function proccessStop (job)
{
  proccessOrder(job);

  const profit_order = orders.find(`${job.id}-tp`);
  if (!profit_order){
    log.error('proccessStop', 'profit order not found!');
    destroyJob(job);
    return;
  }

  const price = job.qty > 0 ? quote.askPrice : quote.bidPrice;
  if (profit_order.price != price){ await amendOrder(profit_order.clOrdID, {price: price}); }
}

async function cancelOrder (id, reason)
{
  await orders.cancel(id, reason);
  bb.emit('OrderCanceled');
}

async function amendOrder (id, params)
{
  await orders.amend(id, params);
  bb.emit('OrderAmended');
}

async function updateTargets (job, sym, qty, px)
{
  log.error('updateTargets', 1);

  const ssl_px = safePrice(px * (1 + -Math.sign(qty) * cfg.broker.sl.soft));
  updateJob(job.id, {sl: ssl_px});

  log.error('updateTargets', 2);

  const hsl_px = safePrice(px * (1 + -Math.sign(qty) * cfg.broker.sl.hard));
  let sl = orders.find(`${job.id}-sl`);
  if (!sl) {
    sl = await orders.stop(`${job.id}-sl`, sym, -qty, hsl_px);
  } else {
    sl = await orders.amend(`${job.id}-sl`, {orderQty: -qty, stopPx: hsl_px});
  }

  log.error('updateTargets', 3);

  const tp_px = safePrice(candle ? candle.bb_ma : px * (1 + Math.sign(qty) * cfg.broker.sl.hard));
  let tp = orders.find(`${job.id}-tp`);
  if (!tp) {
    tp = await orders.profit(`${job.id}-tp`, sym, -qty, tp_px);
  } else {
    tp = await orders.amend(`${job.id}-tp`, {orderQty: -qty, price: tp_px});
  }

  log.error('updateTargets', 4);
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
