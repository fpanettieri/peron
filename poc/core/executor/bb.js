'use strict';

const cfg = require('../../cfg/peron');
const orders = require('../../lib/orders');
const logger = require('../../lib/logger');

const log = new logger('executor/bb');

const OVERLOAD_STEP = 1000;
const SAFE_LONG_TARGET = 100;
const SAFE_SHORT_TARGET = 100000;

const HASH_LEN = 10;
const PREFIX_LEN = 16;

const ORDER_PREFIX_REGEX = /^..-ag-/;
const LIMIT_PREFIX = 'lm-';
const PROFIT_PREFIX = 'tp-';
const STOP_PREFIX = 'sl-';
const AG_PREFIX = 'ag-';

const STATES = { INTENT: 0, ORDER: 1, POSITION: 2, STOP: 3, DONE: 4 };

let bb = null;

const jobs = [];

let overloaded = 0;
let pending = [];
let timeout = null;
let burst = false;

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
  const pos = arr.find(i => i.symbol == cfg.symbol);
  if (!pos || !pos.isOpen) { run(); return; }

  const t = (new Date(pos.openingTimestamp)).getTime();
  const id = genId();

  const job = createJob(id, pos.symbol, pos.currentQty, pos.avgCostPrice, STATES.STOP, t);
  await createTargets(job, pos.symbol, pos.currentQty, pos.avgCostPrice);
  burst = true;

  run();
}

function onOrderSynced (arr)
{
  for (let i = 0; i < arr.length; i++) {
    const o = arr[i];

    if (!ORDER_PREFIX_REGEX.test(o.clOrdID)) {
      log.log('ignored non-peronist order');
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
  createJob(genId(), sym, qty, px, STATES.INTENT, Date.now());
}

function createJob (id, sym, qty, px, state, t)
{
  const job = { id: id, sym: sym, qty: qty, px: px, state: state, t: t, created_at: Date.now()};
  jobs.push(job);
  return job;
}

function updateJob (id, changes)
{
  const idx = jobs.findIndex(j => j.id == id);
  jobs[idx] = {...jobs[idx], ...changes};
  return jobs[idx];
}

function destroyJob (job)
{
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

async function process (job)
{
  switch (job.state){
    case STATES.INTENT: await proccessIntent(job); break;
    case STATES.ORDER: await proccessOrder(job); break;
    case STATES.POSITION: await proccessPosition(job); break;
    case STATES.STOP: await proccessStop(job); break;
    case STATES.DONE: await proccessDone(job); break;
  }
}

async function processPending (o)
{
  if (!ORDER_PREFIX_REGEX.test(o.clOrdID)) {
    log.log('Ignored non-peronist order');
    return;
  }

  let order = orders.find(o.clOrdID);
  if (!order) {
    if (o.ordStatus != 'Canceled') { await orders.discard(o.orderID, 'Unknown Order', o, '\n\n\n'); }
    return;
  }

  order = orders.update(o);
  if (order.ordStatus == 'Canceled' || order.ordStatus == 'Filled') {
    orders.remove(order.clOrdID);
  }

  const jid = order.clOrdID.substr(6, HASH_LEN);
  const prefix = order.clOrdID.substr(0, 3);

  const job = jobs.find(j => j.id == jid);
  if (!job) {
    await orders.cancel(order.clOrdID);
    return;
  }

  if (prefix == LIMIT_PREFIX && order.ordStatus == 'PartiallyFilled') {
    await updatePosition(job, order);
  }

  if (order.ordStatus != 'Filled') { return; }
  switch (prefix) {
    case LIMIT_PREFIX: {
      await updatePosition(job, order);
    } break;

    case PROFIT_PREFIX:
    case STOP_PREFIX: {
      updateJob(job.id, {state: STATES.DONE});
    } break;
  }
}

async function proccessIntent (job)
{
  if (!quote) { return; }

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
    } break;

    case 'Canceled': {
      destroyJob(job);
    } break;

    case 'Duplicated':
    case 'Error':
    default: {
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
    if (job.state == STATES.ORDER){ destroyJob(job); }
    return;
  }

  if (Date.now() - job.created_at > cfg.executor.order.expires) {
    await orders.cancel(order.clOrdID, 'Expired');
    return;
  }

  let price = job.qty > 0 ? quote.bidPrice : quote.askPrice;

  let canceled = null;
  let amended = null;

  if (job.qty > 0) {
    if (price > candle.bb_ma) {
      canceled = await orders.cancel(order.clOrdID, 'MA Crossed');
    } else if (order.price != price){
      amended = await orders.amend(order.clOrdID, {price: price});
    }

  } else {
    if (price < candle.bb_ma) {
      canceled = await orders.cancel(order.clOrdID, 'MA Crossed');
    } else if (order.price != price){
      amended = await orders.amend(order.clOrdID, {price: price});
    }
  }

  if (canceled && canceled.ordStatus == 'Overloaded' || ammended && ammended.ordStatus == 'Overloaded') {
    overloaded = OVERLOAD_STEP;
  } else {
    await preventSlippage(amended, orders.limit);
  }
}

async function proccessPosition (job)
{
  if (!quote || !candle){ return; }
  proccessOrder(job);

  const root = `${PROFIT_PREFIX}${AG_PREFIX}${job.id}`;
  const order = orders.find(root);
  if (!order){ log.fatal(`proccessPosition -> profit order not found! ${root}`, job); }

  let price = safePrice(candle.bb_ma);
  if (job.qty > 0 && price < quote.askPrice) {
    price = quote.askPrice;
  } else if (job.qty < 1 && price > quote.bidPrice) {
    price = quote.bidPrice;
  }

  if (order.price != price){
    const amended = await orders.amend(order.clOrdID, {price: price});
    if (ammended.ordStatus == 'Overloaded') {
      overloaded = OVERLOAD_STEP;
    } else {
      await preventSlippage(amended, orders.profit);
    }
  }

  if (job.qty > 0 && quote.askPrice < job.sl) {
    updateJob(job.id, {state: STATES.STOP});
    burst = true;

  } else if (job.qty < 0 && quote.bidPrice > job.sl) {
    updateJob(job.id, {state: STATES.STOP});
    burst = true;
  }
}

async function proccessStop (job)
{
  if (!quote) { return; }
  proccessOrder(job);

  const root = `${PROFIT_PREFIX}${AG_PREFIX}${job.id}`;
  const order = orders.find(root);
  if (!order){ log.fatal(`proccessStop -> profit order not found! ${root}`, job); }

  const price = job.qty > 0 ? quote.askPrice : quote.bidPrice;
  if (order.price == price){ return; }

  const amended = await orders.amend(order.clOrdID, {price: price});
  await preventSlippage(amended, orders.profit);
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

async function updatePosition (job, order)
{
  let direction = job.qty > 0 ? 1 : -1;
  await createTargets(job, job.sym, direction * (order.orderQty - order.leavesQty), order.avgPx);
  if (job.state == STATES.ORDER) { updateJob(job.id, {state: STATES.POSITION}); }
}

async function createTargets (job, sym, qty, px)
{
  await createTakeProfit(job, sym, qty, px);
  await createStopLoss(job, sym, qty, px);
}

async function createTakeProfit (job, sym, qty, px)
{
  let tp_px = safePrice(px * (1 + Math.sign(qty) * cfg.executor.sl.hard));
  if (candle) { tp_px = qty > 1 ? candle.bb_upper : candle.bb_lower; }
  tp_px = safePrice(tp_px);

  const tp_root = `${PROFIT_PREFIX}${AG_PREFIX}${job.id}`;
  let tp = orders.find(tp_root);
  if (!tp) {
    tp = await orders.profit(`${tp_root}-${genId()}`, sym, -qty, tp_px);
  } else {
    tp = await orders.amend(tp.clOrdID, {orderQty: -qty, price: tp_px});
  }
  await preventSlippage(tp, orders.profit);
}

async function createStopLoss (job, sym, qty, px)
{
  const sl_px = safePrice(px * (1 + -Math.sign(qty) * cfg.executor.sl.hard));
  const sl_root = `${STOP_PREFIX}${AG_PREFIX}${job.id}`;
  let sl = orders.find(`${sl_root}`);
  if (!sl) {
    sl = await orders.stop(`${sl_root}-${genId()}`, sym, -qty, sl_px);
  } else {
    sl = await orders.amend(sl.clOrdID, {orderQty: -qty, stopPx: sl_px});
  }

  const ssl_px = safePrice(px * (1 + -Math.sign(qty) * cfg.executor.sl.soft));
  updateJob(job.id, {sl: ssl_px});
}

async function preventSlippage (order, fn)
{
  if (!order || order.ordStatus !== 'Slipped') { return; }
  orders.remove(order.clOrdID);

  const root = order.clOrdID.substr(0, 16);
  const price = order.leavesQty > 0 ? SAFE_LONG_TARGET : SAFE_SHORT_TARGET;

  let direction = order.side == 'Buy' ? 1 : -1;
  const safeguard = await fn(`${root}-${genId()}`, order.symbol, direction * (order.orderQty - order.leavesQty), price);
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
