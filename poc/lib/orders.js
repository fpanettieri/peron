'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');
const Logger = require('./logger');
const log = new Logger('[lib/orders]');

const SLIPPAGE_ERR = 'Canceled: Order had execInst of ParticipateDoNotInitiate';
const DOUBLE_CANCEL_ERR = 'Unable to cancel order due to existing state: Canceled';
const DUPLICATED_ERR = 'Duplicate clOrdID';
const NOT_FOUND_ERR = 'Not Found';

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
  let order = rsp.body;

  if (rsp.status.code == 200){
    if (order.ordStatus == 'New') {
      add(order);
    } else if (order.ordStatus == 'Canceled' && order.text.indexOf(SLIPPAGE_ERR) > -1) {
      order.ordStatus = 'Slipped';
    }

  } else {
    if (order.error.message == DUPLICATED_ERR) {
      order = {clOrdID: id, ordStatus: 'Duplicated'};
    } else {
      order = {clOrdID: id, ordStatus: 'Error', error: order.error.message};
    }
  }

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
    execInst: 'ParticipateDoNotInitiate',
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
  const _params = {...{ origClOrdID: id }, ...params};
  options.api = 'order';
  options.method = 'PUT';

  const rsp = await bitmex.api(options, _params);
  let order = rsp.body;

  log.debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  log.debug(rsp);
  log.debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

  if (rsp.status.code == 200){
    if (order.ordStatus == 'New') {
      order = update(order);
    }

  } else {
    // this will never happen
    if (order.error.message == DUPLICATED_ERR) {
      order = {clOrdID: id, ordStatus: 'Duplicated'};
    } else {
      order = {clOrdID: id, ordStatus: 'Error', error: order.error.message};
    }
  }

  return order;
}

async function cancel (id, reason)
{
  log.debug(`>>>> cancel order ${id}`, id, reason);

  const params = { clOrdID: id, text: reason };
  options.api = 'order';
  options.method = 'DELETE';

  const rsp = await bitmex.api(options, params);
  if (rsp.body.length > 1) {
    log.error('Canceled multiple orders, this should never happen.');
    log.fatal(rsp);
  }

  let order = null;

  if (rsp.status.code == 200){
    order = update(rsp.body[0]);

    if (order.ordStatus == 'Canceled' && order.error && order.error.indexOf(DOUBLE_CANCEL_ERR) > -1) {
      order.ordStatus = 'DoubleCanceled';
    }

  } else {
    if (rsp.body.error.message == NOT_FOUND_ERR) {
      order = {clOrdID: id, ordStatus: 'NotFound'};
    } else {
      order = {clOrdID: id, ordStatus: 'Error', error: rsp.body.error.message};
    }
  }

  return order;
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
    log.error('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    log.fatal(rsp);
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
    log.fatal(rsp.error);
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
  return o;
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
