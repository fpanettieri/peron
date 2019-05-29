'use strict';

const EventEmitter = require('events');
const logger = require('../lib/logger');
const log = new logger('core/backbone');

class Backbone extends EventEmitter
{
  constructor () {
    super();
    this.queue = [];
  }

  chain (a, b)
  {
    this.on(a, () => this.emit(b));
  }

  // Serialize event resolution
  emit ()
  {
    this.queue.push(arguments);
    if (this.queue.length > 1) { return; }

    while (this.queue.length > 0) {
      super.emit.apply(this, this.queue[0]);
      this.queue.shift();
    }
  }
}

module.exports = Backbone;
