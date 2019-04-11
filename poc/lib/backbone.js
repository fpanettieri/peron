'use strict';

const EventEmitter = require('events');
const logger = require('../lib/logger');
const log = new logger('lib/backbone');

class Backbone extends EventEmitter
{
  constructor () {
    super();
    this.depth = 0;
    this.queue = [];
  }

  chain (a, b)
  {
    this.on(a, () => this.emit(b));
  }

  emit ()
  {
    this.queue.push(...arguments);
    if (this.queue.length > 1) { return; }

    console.log('queued:', this.queue.length);
    // console.log('queue:', this.queue);
    // if
    this.depth++;
    console.log('>'.repeat(this.depth), arguments[0]);
    super.emit.apply(this, arguments);
    this.depth--;
    // this.queue.
  }
}

module.exports = Backbone;
