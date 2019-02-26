'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const Logger = require('./logger');
const log = new Logger('[lib/orders]');

const orders = [];
const options = { api: 'order', testnet: cfg.testnet };

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
  if (rsp.status.code != 200){ return log.error(rsp.error); }

  const order = rsp.body;
  orders.push(order);
  return order;
}

async function amend (id, price)
{
  const params = { origClOrdID: id, price: price };
  options.method = 'PUT';

  const rsp = await bitmex.api(options, params);
  if (rsp.status.code != 200){ return log.error(rsp.error); }

  log.debug(rsp);
  // TODO: return what?
}

async function cancel (id)
{
  const params = { clOrdID: id };
  options.method = 'DELETE';

  const rsp = await bitmex.api(options, params);
  if (rsp.status.code != 200){ return log.error(rsp.error); }

  log.debug(rsp);
  // TODO: return what?
}

function find (id)
{
  return orders.find(o => o.clOrdID === id);
}

function findIndex (id)
{
  return orders.findIndex(o => o.clOrdID === id);
}

function add (o)
{
  orders.push(o);
}

function update (o)
{
  let idx = findIndex(o.clOrdID);
  orders[idx] = {...orders[idx], ...o};
}

function remove (o)
{
  orders.splice(findIndex(o), 1);
}

function debug ()
{
  log.log('\n\n\n\n','======================================================================');
  log.log(orders);
  log.log('======================================================================', '\n\n\n\n');
}

module.exports = {
  create: create,
  amend: amend,
  cancel: cancel,
  find: find,
  findIndex: findIndex,
  update: update,
  remove: remove,
  debug: debug
};
