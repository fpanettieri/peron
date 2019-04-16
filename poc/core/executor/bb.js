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

  switch (order.ordStatus) {
    case 'New': {
      updateJob(job.id, {state: STATES.ORDER});
    } break;

    case 'Slipped': {
      // wait for next frame
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

// Interesting events:
//  Trade Contract event
//  Quote changed
//  Candle closed

function genId ()
{
  return `${Math.random().toString(36).substr(2, HASH_LEN)}`;
}

module.exports = { plug: plug };
