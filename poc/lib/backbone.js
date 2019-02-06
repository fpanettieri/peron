'use strict';

const EventEmitter = require('events');

const logger = require('./logger');
const log = new logger('[lib/backbone]');

class Backbone extends EventEmitter
{
  constructor ()
  {
    log.info('initializing');
    super();
  }

  chain (a, b)
  {
    log.info(`chaining ${a} => ${b}`);
    this.on(a, () => this.emit(b));
  }
}

module.exports = Backbone;
