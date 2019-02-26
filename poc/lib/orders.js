'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const Logger = require('./logger');
const log = new Logger('[lib/orders]');

const orders = [];
const options = { api: 'order', testnet: cfg.testnet };

function find (id)
{
  return orders.find(o => o.clOrdID === id);
}

function findIndex (id)
{
  return orders.findIndex(o => o.clOrdID === id);
}

async function create (id, sym, qty, px)
{
  const params = {
    symbol: sym,
    side: qty > 0 ? 'Buy' : 'Sell',
    orderQty: qty,
    timeInForce: 'GoodTillCancel',
    clOrdID: id,
    ordType: 'Limit',
    price: px,
    execInst: 'ParticipateDoNotInitiate'
  };
  options.method = 'POST';

  // FIXME: hotfix to test broker 'safely'. Remove this line!
  params.orderQty = qty > 0 ? 1 : -1;

  const rsp = await bitmex.api(options, params);

  if (rsp.status.code != 200){
    log.error(rsp.error);
    return null;
  }

  const order = rsp.body;
  orders.push(order);
  return order;
}

async function amend (id, price)
{
  const params = { origClOrdID: id, price: price };
  options.method = 'PUT';
  return await bitmex.api(options, params);
}

async function cancel (id)
{
  const params = { clOrdID: id };
  options.method = 'DELETE';

  const order = await bitmex.api(options, params);
  // TODO: Remove from list

  return order;
}

async function discard (id)
{
  const params = { orderID: id };
  options.method = 'DELETE';
  return await bitmex.api(options, params);
}

module.exports = {
  create: create,
  amend: amend,
  cancel: cancel,
  discard: discard,
};
