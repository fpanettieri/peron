'use strict';

const cfg = require('../cfg/peron');

const logger = require('../lib/logger');
const log = new logger('[core/trader]');

const STB = 0.00000001;

let bb = null;
let quote = {};
let margin = {};

function plug (_bb)
{
  bb = _bb;

  margin.availableMargin = 1;
  margin.walletBalance = 1;

  bb.on('MarginUpdated', onMarginUpdated);
  bb.on('QuoteUpdated', onQuoteUpdated);
  bb.on('OpenLong', onOpenLong);
  bb.on('OpenShort', onOpenShort);
}

function onQuoteUpdated (q)
{
  quote = q;
}

function onMarginUpdated (m)
{
  margin = {...margin, ...m};
}

function onOpenLong (c)
{
  let margin = usableMargin();
  if (margin <= 0) {
    log.warn('OpenLong signal ignored. Not enough margin.');
    return;
  }
  bb.emit('TradeContract', cfg.symbol, marginToContracts(margin), c.c);
}

function onOpenShort (c)
{
  let margin = usableMargin();
  if (margin <= 0) {
    log.warn('OpenShort signal ignored. Not enough margin.');
    return;
  }
  bb.emit('TradeContract', cfg.symbol, -1 * marginToContracts(margin), c.c);
}

function usableMargin ()
{
  let max = (cfg.trader.positions * cfg.trader.size);
  let used = 1 - margin.availableMargin / margin.walletBalance;
  let free = Math.max(max - used, 0);
  return Math.floor(Math.min(free, cfg.trader.size) * margin.walletBalance);
}

function marginToContracts (m)
{
  return Math.round(Math.max(margin * STB * quote.askPrice, 1));
}

module.exports = { plug: plug }
