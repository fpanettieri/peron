'use strict';

const orders = include('lib/orders');
const logger = include('lib/logger');

const log = new logger('executor/dummy');

let bb = null;

async function plug (_bb)
{
  bb = _bb;
  bb.on('TradeContract', onTradeContract);
}

async function onTradeContract (sym, qty, px)
{
  log.log('Trading contract:', sym, qty, px);
}

module.exports = { plug: plug };
