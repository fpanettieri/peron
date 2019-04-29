'use strict';

const assert = require('assert');

const ITERATIONS = 10000000;
const HASH_LEN = 10;

function genId ()
{
  return [...Array(HASH_LEN)].map(i=>(~~(Math.random()*36)).toString(36)).join('');
}

for (let i = 0; i < ITERATIONS; i++) {
  const id = genId();
  console.log(`${i}\t- ${id.length} => ${id}`);
  assert(id.length == 10);
}
