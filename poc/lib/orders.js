'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const Logger = require('./logger');
const log = new Logger('[lib/orders]');

const orders = [];
const options = { api: 'order', testnet: cfg.testnet };

async function create (id, sym, qty, params)
{
  const _params = {...{
    clOrdID: id,
    symbol: sym,
    orderQty: qty,
    side: qty > 0 ? 'Buy' : 'Sell',
    timeInForce: 'GoodTillCancel'
  }, ...params};

  options.method = 'POST';

  const rsp = await bitmex.api(options, _params);
  if (rsp.status.code != 200){ return log.error(rsp); }
  return rsp.body;
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
  log.debug('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ orders.cancel_all');

  const params = { text: reason };
  options.api = 'order/all';
  options.method = 'DELETE';

  log.debug('orders.cancel_all', 1);

  const rsp = await bitmex.api(options, params);

  log.debug('orders.cancel_all', 2);
  if (rsp.status.code != 200){ return log.error(rsp); }

  log.debug('orders.cancel_all', 3);

  // TODO: check what reply makes sense
  log.log(rsp);
}

async function discard (id)
{
  const params = { orderID: id };
  options.method = 'DELETE';

  const rsp = await bitmex.api(options, params);
  if (rsp.status.code != 200){ log.error(rsp.error); }
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
  // FIXME: remove log
  if(findIndex(o.clOrdID) > -1) {
    log.error('duplicated order');
    return;
  }
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
  log.info('############################## orders.debug');
  log.log(orders);
  log.error('############################## orders.debug');
}

module.exports = {
  create: create,
  market: market,
  limit: limit,
  profit: profit,
  stop: stop,

  amend: amend,
  cancel: cancel,
  cancel_all: cancel_all,
  discard: discard,

  find: find,
  findIndex: findIndex,
  add: add,
  update: update,
  remove: remove,

  debug: debug
};
