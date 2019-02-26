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

class Logger
{
  constructor(prefix) { this.prefix = prefix; }
  date ()  { return `[${new Date().toISOString()}]`; }
  debug () { console.info(colors.fg.cyan + this.date(), this.prefix, ...arguments, colors.base.reset); }
  log ()   { console.log(this.date(), this.prefix, ...arguments); }
  info ()  { console.info(colors.fg.green + this.date(), this.prefix, ...arguments, colors.base.reset); }
  warn ()  { console.warn(colors.fg.yellow + this.date(), this.prefix, ...arguments, colors.base.reset); }
  error () { console.error(colors.fg.red + this.date(), this.prefix, ...arguments, colors.base.reset); }
  fatal () { console.error(colors.fg.red + this.date(), this.prefix, ...arguments, colors.base.reset); process.exit(-1); }
}

module.exports = Logger;
