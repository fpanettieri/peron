'use strict';

const cfg = require('../../cfg/peron');
const orders = require('../../lib/orders');
const logger = require('../../lib/logger');

const log = new logger('executor/bb');

let bb = null;
let quote = {};
let candle = null;

async function plug (_bb)
{
  bb = _bb;

  bb.on('QuoteSynced', onQuoteUpdated);
  bb.on('QuoteOpened', onQuoteUpdated);
  bb.on('QuoteUpdated', onQuoteUpdated);

  bb.on('CandleAnalyzed', onCandleAnalyzed);
  bb.on('PositionSynced', onPositionUpdated);
  bb.on('PositionUpdated', onPositionUpdated);
}

function onQuoteUpdated (arr)
{
  quote = arr[arr.length - 1];
  log.log('Quote Updated');
  // TODO: if there is an open order, and the price doesn't match, amend it
}

function onCandleAnalyzed (c)
{
  candle = c;
  log.log('Candle Analyzed');
  // TODO: do I need to do anything here?
}

function onPositionUpdated (p)
{
  log.log('Position Updated');
}


module.exports = { plug: plug };
