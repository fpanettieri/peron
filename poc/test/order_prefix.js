'use strict';

const ORDER_COUNT = 10;
const N_MAX = 1000;

const ORDER_PREFIX_REGEX = /^..-ag-/;
const LIMIT_PREFIX = 'lm-';
const PROFIT_PREFIX = 'tp-';
const STOP_PREFIX = 'sl-';
const AG_PREFIX = 'ag-';

const orders = [];

function genId ()
{
  return `lm-ag-${Math.random().toString(36).substr(2)}`;
}

function find (id)
{
  // FIXME: change so it matches strings that begins with that, not only perfect matches
  return orders.find(o => o.clOrdID === id);
}

function findIndex (id)
{
  return orders.findIndex(o => o.clOrdID === id);
}

for (let i = 0; i < ORDER_COUNT; i++) {
  const n = Math.round(Math.random() * N_MAX);
  orders.push(`${genId()}-${n}`);
}

console.log(orders);
