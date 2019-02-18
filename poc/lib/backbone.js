'use strict';

const EventEmitter = require('events');

const logger = require('./logger');
const log = new logger('[lib/backbone]');

class Backbone extends EventEmitter
{
  constructor ()
  {
    log.log('initializing');
    super();
  }

  chain (a, b)
  {
    log.log(`chaining ${a} => ${b}`);
    this.on(a, () => this.emit(b));
  }

  emit ()
  {
    log.info(arguments[0]);
    return super.emit.apply(this, arguments);
  }
}

module.exports = Backbone;
