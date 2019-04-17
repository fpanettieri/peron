'use strict';

const cfg = require('../../cfg/peron');
const orders = require('../../lib/orders');
const logger = require('../../lib/logger');

const log = new logger('executor/bb');

const AG_PREFIX = 'ag-';

let bb = null;

let quote = {};
let candle = null;
let order = null;

async function plug (_bb)
{
  bb = _bb;

  bb.on('QuoteSynced', onQuoteUpdated);
  bb.on('QuoteOpened', onQuoteUpdated);
  bb.on('QuoteUpdated', onQuoteUpdated);

  bb.on('TradeContract', onTradeContract);
}

function onQuoteUpdated (arr)
{
  quote = arr[arr.length - 1];
  // TODO: update order if New or PartiallyFilled, Cancel if ma is crossed
}

async function onTradeContract (sym, qty, px)
{
  // case 0: no order
    // sync create an order in the desired direction
    // check if the order
  //
  // TODO: dispatch event for log

  const price = qty > 0 ? quote.bidPrice : quote.askPrice;
  order = await orders.limit(`${AG_PREFIX}${genId()}`, sym, qty, price);

  if (!order) { log.fatal('order creation failed'); }

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

    case 'Overloaded': {
      // wait a second and retry
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
