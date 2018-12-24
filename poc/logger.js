'use strict';

const colors = require('./colors');

class Logger
{
  constructor(prefix) { this.prefix = prefix; }
  info ()  { console.info(colors.fg.green + this.prefix, ...arguments, colors.base.reset); }
  log ()   { console.log(this.prefix, ...arguments); }
  warn ()  { console.warn(colors.fg.yellow + this.prefix, ...arguments, colors.base.reset); }
  error () { console.error(colors.fg.red + this.prefix, ...arguments, colors.base.reset); }
}

module.exports = Logger;
