'use strict';

const assert = require('assert');

const logger = require('../lib/logger');
const log = new logger('test/pnl');

async function load_local_execs ()
{
  const execs = require('../doc/execution.js');
  log.log(execs.length);
}

(async () => {
  try {
    await load_local_execs();

  } catch(err) {
    log.error(err);
  }
})();
