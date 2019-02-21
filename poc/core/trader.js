'use strict';

const cfg = require('../cfg/peron');

const logger = require('../lib/logger');
const log = new logger('[core/trader]');

let bb = null;

function plug (_bb)
{
  bb = _bb;
  bb.on('OpenShort', onOpenShort);
  bb.on('OpenLong', onOpenLong);
  bb.on('CloseShort', onCloseShort);
  bb.on('CloseLong', onCloseLong);
}

function onOpenShort (c)
{

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
