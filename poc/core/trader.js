'use strict';

const cfg = require('../cfg/peron');

const logger = require('../lib/logger');
const log = new logger('core/trader');

const STB = 0.00000001;
const MIN_MARGIN = 0.0026;

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

function open (d, c)
{
  const max = cfg.trader.positions * cfg.trader.size;
  const used = 1 - margin.availableMargin / margin.walletBalance;
  const usable = Math.max(max - used, 0);

  // FIXME: remove this logs
  log.log(`available: ${margin.availableMargin} | wallet: ${margin.walletBalance}`)
  log.log(`max: ${max} | used: ${used} | usable: ${usable}`);

  if (usable < MIN_MARGIN) { return; }

  let m = Math.max(cfg.trader.size * margin.walletBalance, MIN_MARGIN);
  const contracts = Math.ceil(m * STB * (d > 0 ? quote.bidPrice: quote.askPrice));

  log.log(`contracts: ${contracts}`);

  bb.emit('TradeContract', cfg.symbol, d * contracts, c.c);
}

module.exports = { plug: plug };
