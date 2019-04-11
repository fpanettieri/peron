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
    this.queue.push(arguments);

    if (this.queue.length > 1) { console.log('shortcut exit, already running'); return; }

    while (this.queue.length > 0) {
      let args = this.queue[0];
      console.log('start ', args[0], `queue size: (${this.queue.length})`);  // remove this
      super.emit.apply(this, args);
      console.log('end ', args[0], `queue size: (${this.queue.length})`, '\n');  // remove this
      this.queue.shift();
    }
  }
}

module.exports = Backbone;
