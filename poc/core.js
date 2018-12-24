'use strict';

let ws = null;
let log = null;

function noop () {}

function init (_ws, _log) {
  ws = _ws;
  log = _log;
}

function open (ws) {
  log.info('connection established');
  // TODO:
  // . auth
  // . fetch open positions
  // . start keepalive
  // . fetch orderbook & price
  // . $$$
}

function dispatch (msg) {
  log.log('dispatch', msg);
}

function close (code, reason) {
  log.info('connection closed:', code, reason);
}

function error (err) {
  log.error(err);
}

module.exports = {
  init: init,
  open: open,
  dispatch: dispatch,
  close: close,
  error: error,
}
