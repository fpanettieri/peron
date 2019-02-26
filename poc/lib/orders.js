'use strict';

const cfg = require('../cfg/peron');
const bitmex = require('../lib/bitmex');

const orders = [];

function get (o)
{

}

function add (o)
{

}

function create (sym, qty, px, id)
{
  // TODO: safe-check params

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

  const options = { method: 'POST', api: 'order', testnet: cfg.testnet };

}

function amend (o)
{

}

function cancel (o)
{

}

module.exports = {
  create: create,
  amend: amend,
  cancel: cancel
};
