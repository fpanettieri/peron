'use strict';

// const position_size = 0.001;

let ev = null;
let balance = 0;

function init (emitter)
{
  log.info('initializing accountant');
  ev = emitter;
  ev.on('BalanceUpdated', onBalanceUpdate);
  // open position
  //
}

function onBalanceUpdate (b)
{
  log.info(`balance updated: ${b}`);
  balance = b;
}
