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
    console.log('arguments:', ...arguments);
    this.queue.push(arguments);
    console.log(`queue (${this.queue.length}):`, this.queue);

    // if (this.queue.length > 1) { return; }

    this.depth++;
    console.log('>'.repeat(this.depth), arguments[0]);
    super.emit.apply(this, arguments);
    this.depth--;

    // this.queue.shift();
  }
}

module.exports = Backbone;
