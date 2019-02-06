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
}

module.exports = Backbone;
