'use strict';

const LB_INTERVAL = 10 * 1000;

class Logger
{
  constructor(prefix) {
    this.prefix = prefix;
    this.t = Date.now();
  }

  format (fn, level, args) {
    if (Date.now() - this.t > LB_INTERVAL) { console.log('\n'); }
    this.t = Date.now();
    const date = new Date().toISOString();
    fn(`[${date} ${level} ${this.prefix}]`, ...args);
  }

  debug () { this.format(console.log, 'DBG', arguments)}
  log ()   { this.format(console.log, 'LOG', arguments)}
  info ()  { this.format(console.info, 'INF', arguments)}
  warn ()  { this.format(console.warn, 'WRN', arguments)}
  error () { this.format(console.error, 'ERR', arguments)}
  fatal () { this.format(console.error, 'FTL', arguments); process.exit(-1); }
}

module.exports = Logger;
