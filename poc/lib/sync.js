'use strict';

const logger = require('./logger');
const log = new logger('[lib/sync]');

const TIMEOUT = 1000;//50;

let locked = false;

function wait (ms)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Mutex
{
  constructor () {
    this.locked = true;
  }

  async lock (id)  {
    log.log(`>>>>>> locked ${id}`);
    while (this.locked) { await wait(TIMEOUT); console.log('.'); }
    this.locked = true;
  }

  unlock (id)  {
    this.locked = false;
    log.log(`>>>>>> locked ${id}`);
  }

  isLocked () { return this.locked; }
}

module.exports = {
  Mutex: Mutex,
  wait: wait
};
