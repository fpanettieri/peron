'use strict';

const EventEmitter = require('events');

class Emitter extends EventEmitter
{
  constructor () { super(); }
  chain (a, b) { this.on(a, () => this.emit(b)) }
}

module.exports = Emitter;
