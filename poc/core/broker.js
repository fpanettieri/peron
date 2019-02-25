'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const logger = require('../lib/logger');
const log = new logger('[core/broker]');

const STATES = { INTENT: 0, ORDER: 1, POSITION: 2, FILLED: 3, DONE: 4 };

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
  log.log('========================================================================');
  log.log(o);
  log.log('========================================================================');

  const stop = o.clOrdID.includes('-sl');
  const job = jobs.find(j => findJob(j, o, stop));

  if (!job) {
    log.error('HANDLE JOB NOT FOUND');
    return;
  }

  if (stop) {
    job.sl = {...job.sl, ...o};
  } else {
    job.order = {...job.order, ...o};

    // TODO: check what happens with large orders
    log.log('job.order.ordStatus', job.order.ordStatus);
    log.log('job.order.leavesQty', job.order.leavesQty);

    if (job.order.ordStatus == 'Filled' && job.order.leavesQty == 0) { job.state = STATES.FILLED; }
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

function findJob (job, order, stop)
{
  if (stop) {
    return job.sl && job.sl.clOrdID == order.clOrdID;
  } else {
    return job.order && job.order.clOrdID == order.clOrdID;
  }
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
    case STATES.FILLED: proccessFilled(job); break;
    case STATES.POSITION: proccessPosition(job); break;
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
  };

  if (job.qty > 0) {
    params.side = 'Buy';
    params.price = quote.bidPrice;
  } else {
    params.side = 'Sell';
    params.price = quote.askPrice;
  }
  // FIXME: handle qty == 0 ??

  const options = { method: 'POST', api: 'order', testnet: cfg.testnet };
  const rsp = await bitmex.api(options, params);

  if (rsp.status.code == 200){
    job.state = STATES.ORDER;
    job.order = rsp.body;
    bb.emit('OrderPlaced', job.sym, params.side, job.qty, params.price, job.id);
  } else {
    log.error(rsp.error);
  }
}

async function proccessOrder (job)
{
  let params = {};
  let method = '';

  if (job.qty > 0) { // LONG
    if (job.order.price == quote.bidPrice) { return; }

    if (quote.bidPrice > candle.bb_ma) {
      method = 'DELETE';
      params.clOrdID = job.id;
    } else {
      params.price = quote.bidPrice;
      params.origClOrdID = job.id;
    }
  } else { // SHORT
    if (job.order.price == quote.askPrice) { return; }

    if (quote.askPrice < candle.bb_ma) {
      method = 'DELETE';
      params.clOrdID = job.id;
    } else {
      method = 'PUT';
      params.price = quote.askPrice;
      params.origClOrdID = job.id;
    }
  }
  // FIXME: handle qty == 0 ??

  const options = { method: method, api: 'order', testnet: cfg.testnet };
  const rsp = await bitmex.api(options, params);

  log.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
  log.log(rsp);
  log.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');

  if (rsp.status.code == 200){

  } else {
    log.error(rsp.error);
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
