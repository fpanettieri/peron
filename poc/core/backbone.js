'use strict';

const EventEmitter = require('events');
const logger = include('lib/logger');
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
      // FIXME: check if this needs to be removed
      if (cfg.backbone.verbose) {
        const msg = this.queue[0][0];
        if (!cfg.backbone.ignore.includes(msg)) { log.log(msg); }
      }

      super.emit.apply(this, this.queue[0]);
      this.queue.shift();
    }
  }
}

module.exports = Backbone;
