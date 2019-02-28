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
  margin = {...margin, ...arr[arr.length - 1]};
}

function onOpenLong (c)
{
  open('long', c);
}

function onOpenShort (c)
{
  open('short', c);
}

function usableMargin ()
{
  let max = cfg.trader.positions * cfg.trader.size;
  let used = 1 - margin.availableMargin / margin.walletBalance;
  let free = Math.max(max - used, 0);
  let usable = Math.min(free, cfg.trader.size) * margin.walletBalance;

  // FIXME: remove this
  log.debug('max margin ', max);
  log.debug('used margin', used);
  log.debug('free margin', free);
  log.debug('usable', usable);
  log.debug('contracts', marginToContracts(usable));

  return usable;
}

function marginToContracts (m)
{
  log.debug('m', m);
  log.debug('quote.askPrice', quote.askPrice);
  return Math.round(Math.max(m * STB * quote.askPrice, 1));
}

function open (t, c)
{
  let margin = usableMargin();
  if (margin <= 0) {
    log.log('Signal ignored. Not enough margin.');
    return;
  }

  let direction = t == 'short' ? -1 : 1;
  bb.emit('TradeContract', cfg.symbol, direction * marginToContracts(margin), c.c);
}

module.exports = { plug: plug };
