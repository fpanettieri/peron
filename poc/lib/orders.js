'use strict';

const bitmex = include('lib/bitmex');
const logger = include('lib/logger');
const log = new logger('lib/orders');

const SLIPPAGE_ERR = 'Canceled: Order had execInst of ParticipateDoNotInitiate';
const DOUBLE_CANCEL_ERR = 'Unable to cancel order due to existing state: Canceled';
const DUPLICATED_ERR = 'Duplicate clOrdID';
const NOT_FOUND_ERR = 'Not Found';
const INVALID_STATUS_ERR = 'Invalid ordStatus';
const INVALID_CLIORDID_ERR = 'Invalid origClOrdID';
const OVERLOAD_ERR = 'The system is currently overloaded. Please try again later.';

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

  options.api = 'order';
  options.method = 'POST';

  const rsp = await bitmex.api(options, _params);
  let order = rsp.body;
  order.ratelimit = rsp.ratelimit;

  if (rsp.status.code == 200){
    if (order.ordStatus == 'New') {
      add(order);
    } else if (order.ordStatus == 'Canceled' && order.text.indexOf(SLIPPAGE_ERR) > -1) {
      order.ordStatus = 'Slipped';
    }

  } else if (rsp.status.code == 503) {
    order = {clOrdID: id, ordStatus: 'Overloaded'};

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
    timeInForce: 'ImmediateOrCancel',
    execInst: 'Close,LastPrice',
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
  order.ratelimit = rsp.ratelimit;

  if (rsp.status.code == 200){
    if (order.ordStatus == 'New') {
      order = update(order);
    } else if (order.ordStatus == 'Canceled' && order.text.indexOf(SLIPPAGE_ERR) > -1) {
      order.ordStatus = 'Slipped';
    }

  } else if (rsp.status.code == 503) {
    order = {clOrdID: id, ordStatus: 'Overloaded'};

  } else {
    if (order.error.message == INVALID_STATUS_ERR) {
      order = {clOrdID: id, ordStatus: 'Invalid'};
    } else if (order.error.message == INVALID_CLIORDID_ERR) {
      order = {clOrdID: id, ordStatus: 'NotFound'};
    } else {
      order = {clOrdID: id, ordStatus: 'Error', error: order.error.message};
    }
  }

  return order;
}

async function cancel (id, reason)
{
  const params = { clOrdID: id, text: reason };
  options.api = 'order';
  options.method = 'DELETE';

  const rsp = await bitmex.api(options, params);
  if (rsp.body.length > 1) { log.fatal('Canceled multiple orders, this should never happen.', rsp); }

  let order = null;
  if (rsp.status.code == 200){
    order = update(rsp.body[0]);

    if (order.ordStatus == 'Canceled' && order.error && order.error.indexOf(DOUBLE_CANCEL_ERR) > -1) {
      order.ordStatus = 'DoubleCanceled';
    }

  } else if (rsp.status.code == 503) {
    order = {clOrdID: id, ordStatus: 'Overloaded'};

  } else {
    if (rsp.body.error.message == NOT_FOUND_ERR) {
      order = {clOrdID: id, ordStatus: 'NotFound'};
    } else {
      order = {clOrdID: id, ordStatus: 'Error', error: rsp.body.error.message};
    }
  }

  order.ratelimit = rsp.ratelimit;
  return order;
}

async function discard (id)
{
  const params = { orderID: id };
  options.api = 'order';
  options.method = 'DELETE';

  const rsp = await bitmex.api(options, params);

  let order = null;
  if (rsp.status.code == 200){
    order = rsp.body;
  } else if (rsp.status.code == 503) {
    order = {clOrdID: id, ordStatus: 'Overloaded'};
  } else if (rsp.status.code != 200) {
    log.fatal(rsp.error);
  }

  order.ratelimit = rsp.ratelimit;
  return order;
}

function find (id)
{
  return orders.find(o => o.clOrdID.indexOf(id) === 0);
}

function findIndex (id)
{
  return orders.findIndex(o => o.clOrdID.indexOf(id) === 0);
}

function add (o)
{
  if(findIndex(o.clOrdID) > -1) { return; }
  orders.push(o);
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
  if(index < 0) { return; }
  orders.splice(index, 1);
}

function debug ()
{
  return orders.map(o => o.clOrdID);
}

module.exports = {
  create: create,
  market: market,
  limit: limit,
  profit: profit,
  stop: stop,

  amend: amend,
  cancel: cancel,
  discard: discard,

  find: find,
  findIndex: findIndex,
  add: add,
  update: update,
  remove: remove,

  debug: debug
};
