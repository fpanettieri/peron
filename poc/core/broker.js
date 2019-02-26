'use strict';

const cfg = require('../cfg/peron');
const orders = require('../lib/orders');
const jobs = require('../lib/jobs');
const logger = require('../lib/logger');
const log = new logger('[core/broker]');

let bb = null;

function plug (_bb)
{
  bb = _bb;

  bb.on('QuoteUpdated', jobs.setQuote);
  bb.on('CandleAnalyzed', jobs.setCandle);

  bb.on('PositionSynced', onPositionSynced);
  bb.on('OrderUpdated', onOrderUpdated);
  bb.on('TradeContract', onTradeContract);
}

function onPositionSynced (arr)
{
  let pos = arr.find(i => i.symbol == cfg.symbol);
  if (!pos || !pos.isOpen) { return; }
  const t = (new Date(pos.openingTimestamp)).getTime();
  jobs.create(pos.symbol, pos.currentQty, pos.avgCostPrice, jobs.STATES.FILLED, t);
}

function onOrderUpdated (o)
{
  log.log('======================================================================');
  log.log('\n\n\n', o, '\n\n\n');

  const order = orders.find(o.clOrdID);
  const job = jobs.find(o.clOrdID.substr(0, 11));

  if (!order || !job) {
    log.log('unknown order!');
    log.log('======================================================================');
    return orders.discard(o.orderID);
  }
  orders.update(o);

  if (o.ordStatus == 'Filled' && o.leavesQty == 0) {
    jobs.update(job, job.qty, o.avgPx, jobs.STATES.FILLED);
  }
}

function onTradeContract (sym, qty, px)
{
  jobs.create(sym, qty, px, jobs.STATES.INTENT, Date.now());
}

function cancelOrder (id, reason, job)
{
  orders.cancel(id, reason);
  job.destroy(job);
  bb.emit('OrderCanceled');
}

function amendOrder (id, price)
{
  orders.amend(id, price);
  bb.emit('OrderAmended');
}

module.exports = { plug: plug };
