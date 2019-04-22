'use strict';

const cfg = require('../../cfg/peron');
const orders = require('../../lib/orders');
const logger = require('../../lib/logger');

const log = new logger('executor/bb');

const OVERLOAD_STEP = 1000;
const SLIPPAGE_OFFSET = 100;

const HASH_LEN = 10;
const PREFIX_LEN = 16;

const ORDER_PREFIX_REGEX = /^..-ag-/;
const LIMIT_PREFIX = 'lm-';
const PROFIT_PREFIX = 'tp-';
const STOP_PREFIX = 'sl-';
const AG_PREFIX = 'ag-';

const STATES = { INTENT: 0, ORDER: 1, POSITION: 2, DONE: 3 };

let bb = null;

const jobs = [];

let overloaded = 0;
let pending = [];
let timeout = null;

let quote = {};
let candle = null;

async function plug (_bb)
{
  bb = _bb;

  bb.on('QuoteSynced', onQuoteUpdated);
  bb.on('QuoteOpened', onQuoteUpdated);
  bb.on('QuoteUpdated', onQuoteUpdated);

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
  log.log('position synced');

  const pos = arr.find(i => i.symbol == cfg.symbol);
  if (!pos || !pos.isOpen) { run(); return; }

  log.log(pos);

  const t = (new Date(pos.openingTimestamp)).getTime();
  const id = genId();

  const job = createJob(id, pos.symbol, pos.currentQty, pos.avgCostPrice, STATES.POSITION, t);

  // FIXME: modify this, create a proper position
  await createTargets(job, pos.symbol, pos.currentQty, pos.avgCostPrice);

  run();
}

function onOrderSynced (arr)
{
  for (let i = 0; i < arr.length; i++) {
    const o = arr[i];

    if (!ORDER_PREFIX_REGEX.test(o.clOrdID)) {
      log.log('ignored unknown order');
      continue;
    }

    orders.discard(arr[i].orderID);
  }
}

function onOrderOpened (arr)
{
  for (let i = 0; i < arr.length; i++) { orders.add(arr[i]); }
  pending = pending.concat(arr);
}

async function onOrderUpdated (arr)
{
  pending = pending.concat(arr);
}

async function onTradeContract (sym, qty, px)
{
  log.log('on trade contract', sym, qty, px);

  // FIXME: testing trader margin allocation
  px += (qty > 0 ? -1 : 1) * 100;

  createJob(genId(), sym, qty, px, STATES.INTENT, Date.now());
  // TODO: check position, and try to exit it if the direction is different
}

function createJob (id, sym, qty, px, state, t)
{
  const job = { id: id, sym: sym, qty: qty, px: px, state: state, t: t, created_at: Date.now()};
  jobs.push(job);

  // FIXME: remove this
  log.log('job created', JSON.stringify(job));

  return job;
}

function updateJob (id, changes)
{
  const idx = jobs.findIndex(j => j.id == id);
  jobs[idx] = {...jobs[idx], ...changes};

  // FIXME: remove this
  log.log('job updated', JSON.stringify(jobs[idx]));

  return jobs[idx];
}

function destroyJob (job)
{
  // FIXME: remove this log
  log.log('job destroyed', JSON.stringify(job));
  return jobs.splice(jobs.findIndex(j => j.id === job.id), 1);
}

async function run ()
{
  while (pending.length > 0) {
    await processPending (pending.shift());
  }

  if (overloaded) {
    overloaded = Math.max(0, overloaded - cfg.executor.speed);
  } else {
    for (let i = jobs.length - 1; i > -1; i--) {
      await process (jobs[i]);
    }
  }

  setTimeout(run, getTimeout());
}

async function processPending (o)
{
  if (!ORDER_PREFIX_REGEX.test(o.clOrdID)) {
    log.log('Ignored external order');
    return;
  }

  let order = orders.find(o.clOrdID);
  if (!order) {
    // FIXME: remove this log
    log.warn('order not found', o.clOrdID);
    if (o.ordStatus != 'Canceled') { await orders.discard(o.orderID); }
    return;
  }

  order = orders.update(o);

  // FIXME: remove this log
  log.info('order', order.ordStatus, order.clOrdID);

  if (order.ordStatus == 'Canceled' || order.ordStatus == 'Filled') {
    orders.remove(order.clOrdID);
  }

  const jid = order.clOrdID.substr(6, HASH_LEN);
  const prefix = order.clOrdID.substr(0, 3);

  // FIXME: remove this log
  log.info('jid', jid);
  log.info('prefix', prefix);

  const job = jobs.find(j => j.id == jid);
  if (!job) {

    // FIXME: remove this log
    log.info('job not found');

    await orders.cancel(order.clOrdID);
    return;
  }

  if (order.ordStatus != 'Filled') { return; }
  switch (prefix) {
    case PROFIT_PREFIX:
    case STOP_PREFIX: {
      updateJob(job.id, {state: STATES.DONE});
    } break;
  }
}

async function process (job)
{
  switch (job.state){
    case STATES.INTENT: await proccessIntent(job); break;
    case STATES.ORDER: await proccessOrder(job); break;
    case STATES.POSITION: await proccessPosition(job); break;
    case STATES.DONE: await proccessDone(job); break;
  }
}

async function proccessIntent (job)
{
  if (!quote) { return; }
  log.log('process intent');

  let price = job.qty > 0 ? quote.bidPrice : quote.askPrice;

  const root = `${LIMIT_PREFIX}${AG_PREFIX}${job.id}`;
  const order = await orders.limit(`${root}-${genId()}`, job.sym, job.qty, price);
  if (!order) { log.fatal(`proccessIntent -> limit order not found! ${root}`, job); }

  switch (order.ordStatus) {
    case 'New': {
      updateJob(job.id, {state: STATES.ORDER});
    } break;

    case 'Slipped': {
      // wait for next frame
    } break;

    case 'Overloaded': {
      overloaded = OVERLOAD_STEP;
      log.warn('overloaded');
    } break;

    case 'Canceled': {
      log.warn('Intent canceled:', order);
      orders.debug();
      destroyJob(job);
    } break;

    case 'Duplicated':
    case 'Error':
    default: {
      log.warn('Intent error:', order);
      orders.debug();
      log.fatal(' >>>>>>>>>>>>>>>>> this should never happen!', job, order, pending);
    }
  }
}

async function proccessOrder (job)
{
  if (!quote) { return; }

  const root = `${LIMIT_PREFIX}${AG_PREFIX}${job.id}`;
  const order = orders.find(root);
  if (!order){
    log.log('order not found');
    if (job.state == STATES.ORDER){ destroyJob(job); }
    return;
  }

  if (Date.now() - job.created_at > cfg.executor.expiration) {
    log.log('order expired');
    await orders.cancel(order.clOrdID, 'Expired');
    return;
  }

  let price = job.qty > 0 ? quote.bidPrice : quote.askPrice;

  let canceled = null;
  let amended = null;

  if (job.qty > 0) {
    if (price > candle.bb_ma) {
      log.log('ma crossed');
      canceled = await orders.cancel(order.clOrdID, 'MA Crossed');
    } else if (order.price != price){
      log.log(`amend long order. price: ${price} order.price: ${order.price}`);
      amended = await orders.amend(order.clOrdID, {price: price});
    }

  } else {
    if (price < candle.bb_ma) {
      log.log('ma crossed');
      canceled = await orders.cancel(order.clOrdID, 'MA Crossed');
    } else if (order.price != price){
      log.log(`amend long order. price: ${price} order.price: ${order.price}`);
      amended = await orders.amend(order.clOrdID, {price: price});
    }
  }

  amended = await preventSlippage(amended, orders.limit);
  handleOverload(amended);
}

async function proccessPosition (job)
{
  if (!quote || !candle){ return; }

  const root = `${PROFIT_PREFIX}${AG_PREFIX}${job.id}`;
  const order = orders.find(root);
  if (!order){ log.fatal(`proccessPosition -> profit order not found! ${root}`, job); }

  const price = job.qty > 0 ? quote.askPrice : quote.bidPrice;
  if (order.price == price){ return; }

  let amended = await orders.amend(order.clOrdID, {price: price});
  amended = await preventSlippage(amended, orders.profit);
  handleOverload(amended);
}

async function proccessDone (job)
{
  destroyJob(job);
  destroyOrder(`${LIMIT_PREFIX}${AG_PREFIX}${job.id}`);
  destroyOrder(`${PROFIT_PREFIX}${AG_PREFIX}${job.id}`);
  destroyOrder(`${STOP_PREFIX}${AG_PREFIX}${job.id}`);
}

async function destroyOrder (root)
{
  const order = orders.find(root);
  if (!order) { return; }

  await orders.cancel(order.clOrdID);
  await orders.remove(root);
}

async function createTargets (job, sym, qty, px)
{
  await createTakeProfit(job, sym, qty, px);
  await createStopLoss(job, sym, qty, px);
}

async function createTakeProfit (job, sym, qty, px)
{
  let tp_px = safePrice(px * (1 + Math.sign(qty) * cfg.executor.sl));
  if (candle) { tp_px = qty > 1 ? candle.bb_upper : candle.bb_lower; }
  tp_px = safePrice(tp_px);

  const tp_root = `${PROFIT_PREFIX}${AG_PREFIX}${job.id}`;
  let tp = orders.find(tp_root);
  if (!tp) {
    tp = await orders.profit(`${tp_root}-${genId()}`, sym, -qty, tp_px);
  } else {
    tp = await orders.amend(tp.clOrdID, {orderQty: -qty, price: tp_px});
  }

  // TODO: handle overload

  await preventSlippage(tp, orders.profit);
}

async function createStopLoss (job, sym, qty, px)
{
  const sl_px = safePrice(px * (1 + -Math.sign(qty) * cfg.executor.sl));
  const sl_root = `${STOP_PREFIX}${AG_PREFIX}${job.id}`;
  let sl = orders.find(`${sl_root}`);
  if (!sl) {
    sl = await orders.stop(`${sl_root}-${genId()}`, sym, -qty, sl_px);
  } else {
    sl = await orders.amend(sl.clOrdID, {orderQty: -qty, stopPx: sl_px});
  }

  // TODO: handle overload

  const ssl_px = safePrice(px * (1 + -Math.sign(qty) * cfg.executor.sl));
  updateJob(job.id, {sl: ssl_px});
}

function handleOverload (order)
{
  if (!order || order.ordStatus !== 'Overloaded') { return false; }
  overloaded = OVERLOAD_STEP;
  return true;
}

async function preventSlippage (order, fn)
{
  if (!order || order.ordStatus !== 'Slipped') { return order; }
  orders.remove(order.clOrdID);

  const root = order.clOrdID.substr(0, 16);
  const price = order.price + (order.leavesQty > 0 ? -1 : 1) * SLIPPAGE_OFFSET;

  let direction = order.side == 'Buy' ? 1 : -1;
  return await fn(`${root}-${genId()}`, order.symbol, direction * (order.orderQty - order.leavesQty), price);
}

function genId ()
{
  return `${Math.random().toString(36).substr(2, HASH_LEN)}`;
}

function getTimeout ()
{
  const step = cfg.executor.speed;
  let timeout = step - (Date.now() % step);
  return timeout;
}

function safePrice (px)
{
  return Math.round(px * 2) / 2;
}

module.exports = { plug: plug };
