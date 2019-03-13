'use strict';

const colors = {
  base: {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m"
  },

  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
  },

  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m"
  }
};

const LB_INTERVAL = 10 * 1000;

class Logger
{
  constructor(prefix) {
    this.prefix = prefix;
    this.t = Date.now();
  }

  lb () {
    if (Date.now() - this.t > LB_INTERVAL) { console.log('\n'); }
    this.t = Date.now();
  }

  date ()  {
    return `[${new Date().toISOString()}]`;
  }

  debug () { this.lb(); console.info(colors.fg.cyan + this.date(), this.prefix, ...arguments, colors.base.reset); }
  log ()   { this.lb(); console.log(this.date(), this.prefix, ...arguments); }
  info ()  { this.lb(); console.info(colors.fg.green + this.date(), this.prefix, ...arguments, colors.base.reset); }
  warn ()  { this.lb(); console.warn(colors.fg.yellow + this.date(), this.prefix, ...arguments, colors.base.reset); }
  error () { this.lb(); console.error(colors.fg.red + this.date(), this.prefix, ...arguments, colors.base.reset); }
  fatal () { this.lb(); console.error(colors.fg.red + this.date(), this.prefix, ...arguments, colors.base.reset); process.exit(-1); }
}

module.exports = Logger;
