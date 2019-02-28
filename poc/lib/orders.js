'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const Logger = require('./logger');
const log = new Logger('[lib/orders]');

const orders = [];
const options = { api: 'order', testnet: cfg.testnet };

async function create (id, sym, qty, params)
{
  log.debug('orders.create', 1);

  const _params = {...{
    clOrdID: id,
    symbol: sym,
    orderQty: qty,
    side: qty > 0 ? 'Buy' : 'Sell',
    timeInForce: 'GoodTillCancel'
  }, ...params};

  options.method = 'POST';

  log.debug('orders.create', 2);

  // FIXME: hotfix to test broker 'safely'. Remove this line!
  params.orderQty = qty > 0 ? 1 : -1;

  log.debug('orders.create', 3);
  const rsp = await bitmex.api(options, _params);

  log.debug('orders.create', 4);
  if (rsp.status.code != 200){ return log.error(rsp); }

  log.debug('orders.create', 5);

  const order = rsp.body;

  log.debug('orders.create', 6);
  orders.push(order);
  
  log.debug('orders.create', 7);

  return order;
}

function market (id, sym, qty)
{
  return create(id, sym, qty, {
    ordType: 'Market',
    timeInForce: 'ImmediateOrCancel'
  });
}

function limit (id, sym, qty, px)
{
  return create(id, sym, qty, {
    ordType: 'Limit',
    execInst: 'ParticipateDoNotInitiate',
    price: px
  });
}

function profit (id, sym, qty, px)
{
  return create(id, sym, qty, {
    ordType: 'Limit',
    execInst: 'ReduceOnly',
    price: px
  });
}

function stop (id, sym, qty, px)
{
  return create(id, sym, qty, {
    ordType: 'Stop',
    execInst: 'ReduceOnly',
    stopPx: px
  });
}

async function amend (id, params)
{
  const p = { origClOrdID: id };
  options.method = 'PUT';

  const rsp = await bitmex.api(options, {...p, ...params});
  if (rsp.status.code != 200){ return log.error(rsp); }
  return rsp.body;
}

async function cancel (id, reason)
{
  const params = { clOrdID: id, text: reason };
  options.method = 'DELETE';

  const rsp = await bitmex.api(options, params);
  if (rsp.status.code != 200){ return log.error(rsp); }
  return rsp.body;
}

async function cancel_all (reason)
{
  const params = { text: reason };
  options.api = 'order/all';
  options.method = 'DELETE';

  const rsp = await bitmex.api(options, params);
  if (rsp.status.code != 200){ return log.error(rsp); }

  // TODO: check what reply makes sense
  log.log(rsp);
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

module.exports = {
  create: create,
  market: market,
  limit: limit,
  profit: profit,
  stop: stop,

  amend: amend,
  cancel: cancel,

  find: find,
  findIndex: findIndex,
  update: update,
  remove: remove
};
