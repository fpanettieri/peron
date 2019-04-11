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
    console.log('[> QUEUEING]   ', arguments[0]);
    this.queue.push(arguments);

    if (this.queue.length > 1) { console.log('[X SHORTCUT]    already running', `queue size: (${this.queue.length})`); return; }

    console.log('\n[. ITERATING]');
    while (this.queue.length > 0) {
      let args = this.queue[0];
      console.log(`[+ START]       ${args[0]} queue size: (${this.queue.length})`);    // remove this
      super.emit.apply(this, args);
      console.log(`[- END]         ${args[0]} queue size: (${this.queue.length})`);  // remove this
      this.queue.shift();
    }
    console.log('[. DONE]\n');
  }
}

module.exports = Backbone;
