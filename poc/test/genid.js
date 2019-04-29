'use strict';

const assert = require('assert');

const ITERATIONS = 10000000;
const HASH_LEN = 10;

function genId ()
{
  return `${Math.random().toString(36).substr(2, HASH_LEN)}`;
}

for (let i = 0; i < ITERATIONS; i++) {
  const id = genId();
  console.log(`${i}\t-\t${id.length}`);
  assert(id.length == 10);
}
