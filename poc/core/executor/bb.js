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

const STATES = { PRE_ENTRY: 0, ENTRY: 1, PRE_EXIT: 2, EXIT: 3, CLEANUP: 4 };

let bb = null;

const jobs = [];

let overloaded = 0;
let pending = [];
let timeout = null;

let pos = {};
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
  bb.on('PositionUpdated', onPositionUpdated);

  bb.on('OrderSynced', onOrderSynced);
  bb.on('OrderOpened', onOrderOpened);
  bb.on('OrderUpdated', onOrderUpdated);

  bb.on('OpenLong', onBandCross);
  bb.on('OpenShort', onBandCross);

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
  pos = arr.find(i => i.symbol == cfg.symbol);
  if (!pos || !pos.isOpen) { run(); return; }

  const t = (new Date(pos.openingTimestamp)).getTime();
  const job = createJob(genId(), pos.symbol, pos.currentQty, pos.avgCostPrice, STATES.PRE_EXIT, t);

  run();
}

async function onPositionUpdated (arr)
{
  const p = arr.find(i => i.symbol == cfg.symbol);
  if (!p) { return; }
  pos = {...pos, ...p};
}

async function onBandCross (p)
{
  if (!pos || pos.currentQty == 0) { return; }
  const t = (new Date(pos.openingTimestamp)).getTime();
  const job = createJob(genId(), pos.symbol, pos.currentQty, pos.avgCostPrice, STATES.PRE_EXIT, t);
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
  createJob(genId(), sym, qty, px, STATES.PRE_ENTRY, Date.now());
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
    await processOrders (pending.shift());
  }

  if (overloaded) {
    overloaded = Math.max(0, overloaded - cfg.executor.speed);
  } else {
    for (let i = jobs.length - 1; i > -1; i--) { await process (jobs[i]); }
  }

  setTimeout(run, getTimeout());
}

async function processOrders (o)
{
  // Ignored external order
  if (!ORDER_PREFIX_REGEX.test(o.clOrdID)) { return; }

  let order = orders.find(o.clOrdID);
  if (!order) {
    if (o.ordStatus != 'Canceled') { await orders.discard(o.orderID); }
    return;
  }

  // Update cached order
  order = orders.update(o);

  const jid = order.clOrdID.substr(6, HASH_LEN);
  const job = jobs.find(j => j.id == jid);
  if (!job) {
    await orders.cancel(order.clOrdID);
    return;
  }

  if (order.ordStatus == 'Canceled' || order.ordStatus == 'Filled') {
    updateJob(job.id, {state: STATES.CLEANUP});
  }
}

async function process (job)
{
  switch (job.state){
    case STATES.PRE_ENTRY: await proccessPreEntry(job); break;
    case STATES.ENTRY: await proccessEntry(job); break;
    case STATES.PRE_EXIT: await proccessPreExit(job); break;
    case STATES.EXIT: await proccessExit(job); break;
    case STATES.CLEANUP: await proccessCleanup(job); break;
  }
}

async function proccessPreEntry (job)
{
  if (!quote) { return; }

  let price = job.qty > 0 ? quote.bidPrice : quote.askPrice;

  const root = `${LIMIT_PREFIX}${AG_PREFIX}${job.id}`;
  const order = await orders.limit(`${root}-${genId()}`, job.sym, job.qty, price);
  if (!order) { log.fatal(`proccessPreEntry -> limit order not found! ${root}`, job); }

  switch (order.ordStatus) {
    case 'New': {
      updateJob(job.id, {state: STATES.ENTRY});
    } break;

    case 'Slipped': {
      // wait for next frame
    } break;

    case 'Overloaded': {
      handleOverload(order);
    } break;

    case 'Canceled':
    case 'Duplicated':
    case 'Error':
    default: {
      log.error('Pre Entry failed', order);
      orders.debug();
      destroyJob(job);
    }
  }
}

async function proccessEntry (job)
{
  if (!quote) { return; }

  const root = `${LIMIT_PREFIX}${AG_PREFIX}${job.id}`;

  const order = orders.find(root);
  if (!order){
    updateJob(job.id, {state: STATES.CLEANUP});
    return;
  }

  if (Date.now() - job.created_at > cfg.executor.expiration) {
    await orders.cancel(order.clOrdID, 'Expired');
    return;
  }

  let price = job.qty > 0 ? quote.bidPrice : quote.askPrice;
  let amended = null;

  if (job.qty > 0) {
    if (price > candle.bb_ma) {
      await orders.cancel(order.clOrdID, 'MA Crossed');
    } else if (order.price != price){
      amended = await orders.amend(order.clOrdID, {price: price});
    }
  } else {
    if (price < candle.bb_ma) {
      await orders.cancel(order.clOrdID, 'MA Crossed');
    } else if (order.price != price){
      amended = await orders.amend(order.clOrdID, {price: price});
    }
  }

  if (amended) {
    amended = await preventSlippage(amended, orders.limit);
    handleOverload(amended);
  }
}

async function proccessPreExit (job)
{
  if (!quote) { return; }

  const sl = await createStopLoss(job);
  const tp = await createTakeProfit(job);

  if (sl && tp) { updateJob(job.id, {state: STATES.EXIT}); }
}

async function proccessExit (job)
{
  if (!quote){ return; }

  const root = `${PROFIT_PREFIX}${AG_PREFIX}${job.id}`;
  const order = orders.find(root);
  if (!order){ log.fatal(`proccessExit -> profit order not found! ${root}`, job); }

  const price = job.qty > 0 ? quote.askPrice : quote.bidPrice;
  if (order.price == price){ return; }

  const amended = await orders.amend(order.clOrdID, {price: price});
  amended = await preventSlippage(amended, orders.profit);
  handleOverload(amended);
}

async function proccessCleanup (job)
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

async function createStopLoss (job)
{
  const px = safePrice(job.px * (1 + -Math.sign(job.qty) * cfg.executor.sl));
  const root = `${STOP_PREFIX}${AG_PREFIX}${job.id}`;

  let sl = orders.find(root);
  if (!sl) {
    sl = await orders.stop(`${root}-${genId()}`, job.sym, -job.qty, px);
  } else {
    sl = await orders.amend(sl.clOrdID, {orderQty: -job.qty, stopPx: px});
  }

  return sl.ordStatus == 'New';
}

async function createTakeProfit (job)
{
  const px = job.qty > 0 ? quote.askPrice : quote.bidPrice;
  const root = `${PROFIT_PREFIX}${AG_PREFIX}${job.id}`;

  let tp = orders.find(root);
  if (!tp) {
    tp = await orders.profit(`${root}-${genId()}`, job.sym, -job.qty, px);
  } else {
    tp = await orders.amend(tp.clOrdID, {orderQty: -job.qty, price: px});
  }

  return tp.ordStatus == 'New';
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
