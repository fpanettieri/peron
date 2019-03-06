'use strict';

const cfg = require('../../cfg/peron');
const orders = require('../../lib/orders');
const logger = require('../../lib/logger');
const log = new logger('[broker/bitmex]');

const ORDER_PREFIX_REGEX = /^ag-/;
const LIMIT_SUFFIX = '-lm';
const PROFIT_SUFFIX = '-tp';
const STOP_SUFFIX = '-sl';

const STATES = { INTENT: 0, ORDER: 1, POSITION: 2, STOP: 3 };

let bb = null;

const jobs = [];

let pending = [];
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
  if (!pos || !pos.isOpen) { return; }

  const t = (new Date(pos.openingTimestamp)).getTime();
  const id = genId();

  const job = createJob(id, pos.symbol, pos.currentQty, pos.avgCostPrice, STATES.STOP, t);
  await updateTargets(job, pos.symbol, pos.currentQty, pos.avgCostPrice);
  burst = true;
  await run();
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
  log.debug('%% OPENED %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
  log.debug(arr);
  log.debug('%% OPENED %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');

  for (let i = 0; i < arr.length; i++) { orders.add(arr[i]); }
  pending = pending.concat(arr);
}

async function onOrderUpdated (arr)
{
  log.debug('%% UPDATED %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
  log.debug(arr);
  log.debug('%% UPDATED %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');

  pending = pending.concat(arr);
}

async function onTradeContract (sym, qty, px)
{
  log.log('onTradeContract', sym, qty, px, '\n');

  if (jobs.length >= cfg.broker.max_jobs) { return; }
  createJob(genId(), sym, qty, px, STATES.INTENT, Date.now());
  await run();
}

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}`;
}

function createJob (id, sym, qty, px, state, t)
{
  log.debug('>>>> creating job', id);
  // TODO: stats - reports?
  const job = { id: id, sym: sym, qty: qty, px: px, state: state, t: t, created_at: Date.now()};
  jobs.push(job);
  return job;
}

function updateJob (id, changes)
{
  log.debug('>>>> updating job', id, changes);
  // TODO: stats - reports?
  const idx = jobs.findIndex(j => j.id == id);
  jobs[idx] = {...jobs[idx], ...changes};
  return jobs[idx];
}

function destroyJob (job)
{
  log.debug('>>>> destroying job', job.id);
  return jobs.splice(jobs.findIndex(j => j.id === job.id), 1);
}

async function run ()
{
  log.warn(`>>>> run o: ${pending.length} j: ${jobs.length}`);

  while (pending.length > 0) {
    await processPending (pending.pop());
  }

  for (let i = jobs.length - 1; i > -1; i--) {
    await process (jobs[i]);
  }

  if (jobs.length == 0) { return; }
  setTimeout(run, getTimeout());
}

async function process (job)
{
  switch (job.state){
    case STATES.INTENT: await proccessIntent(job); break;
    case STATES.ORDER: await proccessOrder(job); break;
    case STATES.POSITION: await proccessPosition(job); break;
    case STATES.STOP: await proccessStop(job); break;
  }
}

async function processPending (o)
{
  log.debug('>>>> pending order');
  log.debug(o);
  log.debug('>>>> pending order');


  if (!ORDER_PREFIX_REGEX.test(o.clOrdID)) {
    log.log('Ignored non-peronist order');
    return;
  }

  let order = orders.find(o.clOrdID);
  if (!order) {
    if (o.ordStatus != 'Canceled') { await orders.discard(o.orderID, 'Unknown Order'); }
    return;
  }
  order = orders.update(o);

  if (order.ordStatus == 'Canceled' || order.ordStatus == 'Filled') {
    orders.remove(order);
  }

  const jid = order.clOrdID.substr(0, 11);
  const suffix = order.clOrdID.substr(order.clOrdID.length - 3);

  const job = jobs.find(j => j.id == jid);
  if (!job) {
    await orders.cancel(order.clOrdID);
    return;
  }

  if (suffix == LIMIT_SUFFIX && order.ordStatus == 'PartiallyFilled') {
    await updatePosition(job, order);
  }

  if (order.ordStatus != 'Filled') { return; }
  switch (suffix) {
    case LIMIT_SUFFIX: {
      await updatePosition(job, order);
    } break;

    case PROFIT_SUFFIX: {
      destroyJob(job);
      await orders.cancel(`${job.id}${STOP_SUFFIX}`);
    } break;

    case STOP_SUFFIX: {
      destroyJob(job);
      await orders.cancel(`${job.id}${PROFIT_SUFFIX}`);
    } break;
  }
}

async function proccessIntent (job)
{
  if (!quote) { return; }

  let price = job.qty > 0 ? quote.bidPrice : quote.askPrice;
  const order = await orders.limit(`${job.id}${LIMIT_SUFFIX}`, job.sym, job.qty, price);
  if (order) {
    updateJob(job.id, {state: STATES.ORDER});
    bb.emit('OrderPlaced');
  } else {
    bb.emit('OrderFailed');
  }
}

async function proccessOrder (job)
{
  if (!quote) { return; }

  const order = orders.find(`${job.id}${LIMIT_SUFFIX}`);
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
  if (!quote || !candle){ return; }
  proccessOrder(job);

  const profit_order = orders.find(`${job.id}${PROFIT_SUFFIX}`);
  if (!profit_order){ log.fatal('proccessPosition -> profit order not found!'); }

  let price = safePrice(candle.bb_ma);
  if (profit_order.price != price){
    await amendOrder(profit_order.clOrdID, {price: price});
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

  const profit_order = orders.find(`${job.id}${PROFIT_SUFFIX}`);
  if (!profit_order){ log.fatal('proccessStop -> profit order not found!');}

  const price = job.qty > 0 ? quote.askPrice : quote.bidPrice;
  if (profit_order.price != price){ await amendOrder(profit_order.clOrdID, {price: price}); }
}

async function updatePosition (job, order)
{
  updateJob(job.id, {state: STATES.POSITION});
  let direction = job.qty > 0 ? 1 : -1;
  await updateTargets(job, job.sym, direction * (order.orderQty - order.leavesQty), order.avgPx);
}

async function updateTargets (job, sym, qty, px)
{
  const ssl_px = safePrice(px * (1 + -Math.sign(qty) * cfg.broker.sl.soft));
  updateJob(job.id, {sl: ssl_px});

  const hsl_px = safePrice(px * (1 + -Math.sign(qty) * cfg.broker.sl.hard));
  let sl = orders.find(`${job.id}${STOP_SUFFIX}`);
  if (!sl) {
    sl = await orders.stop(`${job.id}${STOP_SUFFIX}`, sym, -qty, hsl_px);
  } else {
    sl = await orders.amend(`${job.id}${STOP_SUFFIX}`, {orderQty: -qty, stopPx: hsl_px});
  }

  const tp_px = safePrice(candle ? candle.bb_ma : px * (1 + Math.sign(qty) * cfg.broker.sl.hard));
  let tp = orders.find(`${job.id}${PROFIT_SUFFIX}`);
  if (!tp) {
    tp = await orders.profit(`${job.id}${PROFIT_SUFFIX}`, sym, -qty, tp_px);
  } else {
    tp = await orders.amend(`${job.id}${PROFIT_SUFFIX}`, {orderQty: -qty, price: tp_px});
  }
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

function getTimeout ()
{
  const step = burst ? cfg.broker.speed.burst : cfg.broker.speed.normal;
  let timeout = step - (Date.now() % step);
  return timeout;
}

function safePrice (px)
{
  return Math.round(px * 2) / 2;
}

module.exports = { plug: plug };
