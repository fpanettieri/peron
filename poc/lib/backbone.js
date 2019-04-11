'use strict';

const EventEmitter = require('events');
const logger = require('../lib/logger');
const log = new logger('lib/backbone');

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

  emit ()
  {
    if (arguments[0] == 'TradeContract') { console.log('##########################################################'); }

    console.log('pushing ', arguments[0]);
    console.log(`queue size: (${this.queue.length})`);

    this.queue.push(arguments);
    if (this.queue.length > 1) { return; }

    let args = null;
    while (args = this.queue.shift()) {
      console.log('>'.repeat(this.queue.length), args[0]);
      super.emit.apply(this, args);
    }

    console.log(`queue size: (${this.queue.length})`);
  }
}

module.exports = Backbone;
