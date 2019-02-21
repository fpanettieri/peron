'use strict';

const cfg = require('../cfg/peron');

const logger = require('../lib/logger');
const log = new logger('[core/trader]');

const BTS = 0.00000001;

let bb = null;
let quote = {};
let margin = {};

function plug (_bb)
{
  bb = _bb;

  // TODO: if at the beggining, there is a pre-existing position, close it before starting

  bb.on('MarginUpdated', onMarginUpdated);
  bb.on('QuoteUpdated', onQuoteUpdated);
  bb.on('OpenShort', onOpenShort);
  bb.on('OpenLong', onOpenLong);
  bb.on('CloseShort', onCloseShort);
  bb.on('CloseLong', onCloseLong);
}

function onQuoteUpdated (q)
{
  quote = q;
}

function onMarginUpdated (m)
{
  margin = {...margin, ...m};

  log.log('balance', margin.walletBalance);
  log.log('available', margin.availableMargin);
  log.log('in use', 1 - margin.availableMargin / margin.walletBalance);
}

function onOpenShort (c)
{
  if (!enoughMargin()) { return; }
  
  // margin.marginBalance

}

function onOpenLong (c)
{

}

function onCloseShort (c)
{

}

function onCloseLong (c)
{

}

module.exports = { plug: plug }
