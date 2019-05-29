'use strict';

const assert = require('assert');

const logger = include('lib/logger');
const log = new logger('test/prefix');

const ORDER_COUNT = 10;
const N_MAX = 1000;
const CHECKS = 10;

const ORDER_PREFIX_REGEX = /^..-ag-/;
const LIMIT_PREFIX = 'lm-';
const PROFIT_PREFIX = 'tp-';
const STOP_PREFIX = 'sl-';
const AG_PREFIX = 'ag-';

const orders = [];

function genId ()
{
  const id = [...Array(HASH_LEN)].map(i=>(~~(Math.random()*36)).toString(36)).join('');
  return `lm-ag-${id}-0`;
}

function find (id)
{
  return orders.find(o => o.indexOf(id) === 0);
}

function findIndex (id)
{
  return orders.findIndex(o => o.indexOf(id) === 0);
}

for (let i = 0; i < ORDER_COUNT; i++) {
  const n = Math.round(Math.random() * N_MAX);
  orders.push(`${genId()}-${n}`);
}

for (let i = 0; i < CHECKS; i++) {
  const rnd = Math.floor(Math.random() * orders.length);
  const order = orders[rnd];
  const short = order.substr(0, 16);
  const found = find(short);

  assert (order == found);
  assert (ORDER_PREFIX_REGEX.test(found));
}
