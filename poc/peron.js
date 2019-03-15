'use strict';

const cfg = require('./cfg/peron');

const logger = require('./lib/logger');
const backbone = require('./lib/backbone');

const modules = [];

(async () => {
  const bb = new backbone();

  for (let i = 0; i < cfg.modules.length; i++) {
    const m = require(cfg.modules[i]);
    m.plug(bb);
    modules.push(m);
  }

  for (let i = 0; i < cfg.backbone.chain.length; i++) {
    const io = cfg.backbone.chain[i];
    bb.chain(io[0], io[1]);
  }

  bb.emit(cfg.backbone.emit);
})();
