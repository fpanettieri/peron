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

  bb.on('MarginSynced', onMarginUpdated);
  bb.on('MarginUpdated', onMarginUpdated);

  bb.on('QuoteSynced', onQuoteUpdated);
  bb.on('QuoteUpdated', onQuoteUpdated);
  bb.on('QuoteOpened', onQuoteUpdated);

  bb.on('OpenLong', onOpenLong);
  bb.on('OpenShort', onOpenShort);
}

function onQuoteUpdated (arr)
{
  quote = arr[arr.length - 1];
}

function onMarginUpdated (arr)
{
  margin = {...margin, ...arr[0]};
}

function onOpenLong (c)
{
  open(1, c);
}

function onOpenShort (c)
{
  open(-1, c);
}

function usableMargin ()
{
  let max = cfg.trader.positions * cfg.trader.size;
  let used = 1 - margin.availableMargin / margin.walletBalance;
  return Math.max(max - used, 0);
}

function open (d, c)
{
  let usable = usableMargin();
  log.debug('usable', usable);

  let base = cfg.trader.size * margin.walletBalance;
  log.debug('base', base);

  let safe = Math.max(base, cfg.trader.min_margin);
  log.debug('safe', safe);

  let allocated = Math.min(free, cfg.trader.size) * margin.walletBalance;
  if (m <= 0) { return; }

  const contracts = Math.round(m * STB * quote.askPrice);

  log.debug('contracts', contracts);

  // bb.emit('TradeContract', cfg.symbol, d * contracts, c.c);
}

module.exports = { plug: plug };
