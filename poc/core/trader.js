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

  margin.availableMargin = 1;
  margin.walletBalance = 1;

  bb.on('MarginUpdated', onMarginUpdated);
  bb.on('QuoteUpdated', onQuoteUpdated);
  bb.on('PositionSynced', onPositionSynced);
  bb.on('OpenShort', onOpenShort);
  bb.on('OpenLong', onOpenLong);
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
  if (!pos.isOpen) { return; }
  log.error('close it??');
  // We can easily close it, by placing a sell order at the MA.
}

function enoughMargin ()
{
  let max = (cfg.trader.orders * cfg.trader.size);
  let used = 1 - margin.availableMargin / margin.walletBalance;
  return used < max;
}

function onOpenShort (c)
{
  if (!enoughMargin()) { return; }

  let margin =

  // margin.marginBalance

}

function onOpenLong (c)
{
  if (!enoughMargin()) { return; }


  bb.emit('BuyContract', );
}

module.exports = { plug: plug }
