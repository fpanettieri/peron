'use strict';

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
    while (this.locked) { await wait(TIMEOUT); }
    this.locked = true;
  }

  async unlock ()  {
    this.locked = false;
  }
}

module.exports = Mutex;
