'use strict';

const assert = require('assert');

const logger = require('../lib/logger');
const log = new logger('test/pnl');

const STB = 0.00000001;

async function load_local_execs ()
{
  const execs = require('../doc/executions.js');
  log.log('execs count:', execs.length);

  const acc = execs.reduce((acc, e) => acc + e.homeNotional, 0);
  log.log(acc);
}

(async () => {
  try {
    await load_local_execs();

  } catch(err) {
    log.error(err);
  }
})();
