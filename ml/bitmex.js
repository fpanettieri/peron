'use strict';

const crypto = require('crypto');
const https = require('./https');

const Logger = require('../lib/logger');
const logger = new Logger('[lib/bitmex]');

function init (key, secret, sandbox, verbose = false)
{
  logger.info('instantiating binance api');
  let binance = node_api().options({
    APIKEY: key,
    APISECRET: secret,
    useServerTime: true,
    test: sandbox,
    verbose: verbose
  });
  logger.info('binance api ready');

  return binance;
}

function candlesticks (binance, symbol, interval, options)
{
  return new Promise(function(resolve, reject) {
    binance.candlesticks(symbol, interval, function (error, ticks, _symbol) {
      if (error) { reject (error); }
      if (symbol !== _symbol) { reject('Symbol mismatched'); }
      resolve(ticks);
    }, options);
  });
}

function candleToObj (arr)
{
  return { t: arr[0], o: arr[1], h: arr[2], l: arr[3], c: arr[4], v: arr[5], T: arr[6], q: arr[7], n: arr[8], V: arr[9], Q: arr[10], B: arr[11] }
}

module.exports = {
  init: init,
  candlesticks: candlesticks,
  candleToObj: candleToObj
}
