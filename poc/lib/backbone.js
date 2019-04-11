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
    console.log('start ', arguments[0], `queue size: (${this.queue.length})`);  // remove this
    if (this.queue.length > 1) { console.log('shortcut exit, already running'); return; }

    while (this.queue.length > 0) {
      console.log('>', this.queue[0][0]);
      super.emit.apply(this, this.queue.shift());
    }

    console.log('end ', arguments[0], `queue size: (${this.queue.length})`, '\n');  // remove this
  }
}

module.exports = Backbone;
