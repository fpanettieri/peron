'use strict';

const cfg = require('../../cfg/peron');
const orders = require('../../lib/orders');
const logger = require('../../lib/logger');

const log = new logger('executor/bb');

let bb = null;
let quote = {};
let candle = null;

async function plug (_bb)
{
  bb = _bb;

  bb.on('TradeContract', onTradeContract);
}

async function onTradeContract (sym, qty, px)
{
  // case 0: no order
    // sync create an order in the desired direction
    // check if the order
  //

  const order = await orders.limit(`${root}-${genId()}`, job.sym, job.qty, price);
  if (!order) { log.fatal(`proccessIntent -> limit order not found! ${root}`, job); }
}

// Interesting events:
//  Trade Contract event
//  Quote changed
//  Candle closed

module.exports = { plug: plug };
