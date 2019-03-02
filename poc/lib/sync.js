'use strict';

const logger = require('./logger');
const log = new logger('[lib/sync]');

const TIMEOUT = 50;

let locked = false;

function wait (ms)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Mutex
{
  constructor() { this.locked = false; }

  async lock ()  {
    log.log('>>>>>> locked');
    while (this.locked) { await wait(TIMEOUT); }
    this.locked = true;
  }

  unlock ()  {
    this.locked = false;
    log.log('>>>>>> unlocked');
  }

  get locked () {
    return this.locked;
  }
}

module.exports = {
  Mutex: Mutex,
  wait: wait
};
