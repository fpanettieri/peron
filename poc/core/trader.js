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
  // bb.on('PositionSynced', onPositionSynced);
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

// function onPositionSynced (arr)
// {
//   let pos = arr.find(i => i.symbol == 'XBTUSD');
//   if (!pos || !pos.isOpen) { return; }
//   log.error('close it??');
//   // We can easily close it, by placing a sell order at the MA.
// }

function onOpenLong (c)
{
  let margin = usableMargin();
  log.log('Usable Margin:', margin);
  if (margin <= 0) { return; }
  bb.emit('BuyContract', cfg.symbol, marginToContracts(margin), c.c);
}

function onOpenShort (c)
{
  let margin = usableMargin();
  log.log('Usable Margin:', margin);
  if (margin <= 0) { return; }
  bb.emit('SellContract', cfg.symbol, marginToContracts(margin), c.c);
}

function usableMargin ()
{
  let max = (cfg.trader.orders * cfg.trader.size);
  let used = 1 - margin.availableMargin / margin.walletBalance;
  let free = Math.max(max - used, 0);
  return Math.floor(Math.min(free, cfg.trader.size) * margin.walletBalance);
}

function marginToContracts (m)
{
  return Math.round(Math.max(margin * STB * quote.askPrice, 1));
}

module.exports = { plug: plug }
