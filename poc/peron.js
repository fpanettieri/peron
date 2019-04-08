'use strict';

const cfg = require('./cfg/peron');

const logger = require('./lib/logger');
const backbone = require('./lib/backbone');

const modules = [];

(async () => {
  const log = new logger(`peron`);
  log.info('peronizando');

  const bb = new backbone();

  for (let i = 0; i < cfg.modules.length; i++) {
    const name = cfg.modules[i];
    const m = require(`./${name}`);
    log.info(`loading module ${name}`);

    m.plug(bb);
    modules.push(m);
  }

  for (let i = 0; i < cfg.backbone.chain.length; i++) {
    const io = cfg.backbone.chain[i];
    log.log(`chaining ${io[0]} => ${io[1]}`);
    bb.chain(io[0], io[1]);
  }

  bb.emit(cfg.backbone.emit);
})();
