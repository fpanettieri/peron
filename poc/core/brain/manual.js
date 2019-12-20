'use strict';

const logger = include('lib/logger');
const log = new logger('brain/manual');

let bb = null;

function plug (_bb)
{
  bb = _bb;
}

module.exports = { plug: plug };
