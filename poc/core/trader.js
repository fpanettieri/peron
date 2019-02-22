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
  bb.on('PositionSynced', onPositionSynced);
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

function onPositionSynced (arr)
{
  let pos = arr.find(i => i.symbol == 'XBTUSD');
  if (!pos || !pos.isOpen) { return; }
  log.error('close it??');
  // We can easily close it, by placing a sell order at the MA.
}

function usableMargin ()
{
  let max = (cfg.trader.orders * cfg.trader.size);
  let used = 1 - margin.availableMargin / margin.walletBalance;
  let free = Math.max(max - used, 0);
  return Math.min(free, cfg.trader.size) * margin.walletBalance;
}

function onOpenLong (c)
{
  let margin = usableMargin();
  log.log('Usable Margin:', margin);

  if (margin <= 0) { return; }

  log.log('BUY!', margin * STB * quote.askPrice);
  let amount = Math.max(margin * STB * quote.askPrice, 1);
  bb.emit('BuyContract', cfg.symbol, amount);
}

function onOpenShort (c)
{
  let margin = usableMargin();
  log.log('Usable Margin:', margin);

  if (margin <= 0) { return; }

  log.log('SELL!', margin * STB * quote.askPrice);
  let amount = Math.max(margin * STB * quote.askPrice, 1);
  bb.emit('SellContract', cfg.symbol, amount);
}

module.exports = { plug: plug }
