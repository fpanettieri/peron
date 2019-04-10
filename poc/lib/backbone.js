'use strict';

const EventEmitter = require('events');
const logger = require('../lib/logger');
const log = new logger('lib/backbone');

class Backbone extends EventEmitter
{
  chain (a, b)
  {
    this.on(a, () => this.emit(b));
  }

  emit ()
  {
    log.info(arguments[0]);
    return super.emit.apply(this, arguments);
  }
}

module.exports = Backbone;
