'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const Logger = require('./logger');
const log = new Logger('[lib/orders]');

const orders = [];
const options = { api: 'order', testnet: cfg.testnet };

async function create (id, sym, qty, params)
{
  // FIXME: debug
  log.debug('>>>> create order', id);

  const _params = {...{
    clOrdID: id,
    symbol: sym,
    orderQty: qty,
    side: qty > 0 ? 'Buy' : 'Sell',
    timeInForce: 'GoodTillCancel'
  }, ...params};

  options.api = 'order';
  options.method = 'POST';

  const rsp = await bitmex.api(options, _params);
  if (rsp.status.code != 200){
    // FIXME: debug
    log.error('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    log.error('creating failed', id, sym, qty, params);
    return log.error(rsp);
  }

  const order = rsp.body;
  add(order);
  return order;
}

async function market (id, sym, qty)
{
  return await create(id, sym, qty, {
    ordType: 'Market',
    timeInForce: 'ImmediateOrCancel'
  });
}

async function limit (id, sym, qty, px)
{
  return await create(id, sym, qty, {
    ordType: 'Limit',
    execInst: 'ParticipateDoNotInitiate',
    price: px
  });
}

async function profit (id, sym, qty, px)
{
  return await create(id, sym, qty, {
    ordType: 'Limit',
    execInst: 'ReduceOnly',
    price: px
  });
}

async function stop (id, sym, qty, px)
{
  return await create(id, sym, qty, {
    ordType: 'Stop',
    execInst: 'ReduceOnly',
    stopPx: px
  });
}

async function amend (id, params)
{
  const order = find(id);

  // FIXME: debug
  log.debug(`>>>> amend order ${id}`, order ? order.ordStatus : 'null', params);

  if (!order || order.ordStatus == 'Canceled' || order.ordStatus == 'Filled') { return; }

  const p = { origClOrdID: id };
  options.api = 'order';
  options.method = 'PUT';

  const rsp = await bitmex.api(options, {...p, ...params});
  if (rsp.status.code != 200){
    // FIXME: debug
    log.error('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    log.error('amending failed', id, params);
    log.error(order);
    log.error('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    return order;
  }

  return update(rsp.body);
}

async function cancel (id, reason)
{
  const order = find(id);
  // FIXME: debug
  log.debug(`>>>> cancel order ${id}`, order ? order.ordStatus : 'null');

  if (!order || order.ordStatus == 'Canceled' || order.ordStatus == 'Filled') { return; }

  const params = { clOrdID: id, text: reason };
  options.api = 'order';
  options.method = 'DELETE';

  const rsp = await bitmex.api(options, params);
  if (rsp.status.code != 200){
    // FIXME: debug
    log.error('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    log.error('canceling', id, params);
    log.error('failed', rsp);
    return order;
  }

  return update(rsp.body[0]);
}

async function cancel_all (symbol, reason)
{
  // FIXME: debug
  log.debug('>>>> cancel all', symbol);

  const params = { symbol: symbol, text: reason };
  options.api = 'order/all';
  options.method = 'DELETE';

  const rsp = await bitmex.api(options, params);
  if (rsp.status.code != 200){
    // FIXME: debug
    log.error('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    log.error('canceling', params);
    log.error('failed', rsp);
    return;
  }

  for (let i = 0; i < rsp.body.length; i++) { update(rsp.body[i]); }
}

async function discard (id)
{
  log.debug('>>>> discard', id);

  const params = { orderID: id };
  options.api = 'order';
  options.method = 'DELETE';

  const rsp = await bitmex.api(options, params);
  if (rsp.status.code != 200){
    log.error(rsp.error);
    return;
  }
  return rsp.body;
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
  if(findIndex(o.clOrdID) > -1) { return; }
  log.debug(`>>>> add ${o.clOrdID}`);
  orders.push(o);
  debug();
}

function update (o)
{
  let idx = findIndex(o.clOrdID);
  orders[idx] = {...orders[idx], ...o};
  return orders[idx];
}

function remove (cl_id)
{
  const index = findIndex(cl_id);
  debug();
  log.debug(`>>>> remove ${cl_id} - ${index}`);
  if(index < 0) { return; }
  orders.splice(index, 1);
  debug();
}

function debug ()
{
  log.log(orders.map(o => o.clOrdID));
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
