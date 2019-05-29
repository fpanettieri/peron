'use strict';

// --- Global setup ---
global.cfg = require(`./cfg/${process.argv[2]}`);
global.include = function (file) { return require(`${__dirname}/${file}`); }

// --- Global setup ---
const logger = include('lib/logger');
const backbone = include('core/backbone');
const modules = [];

(async () => {
  const log = new logger(cfg.name);
  const bb = new backbone();

  try {
    for (let i = 0; i < cfg.modules.length; i++) {
      const name = cfg.modules[i];
      const m = require(`./${name}`);
      log.log(`loading module ${name}`);

      m.plug(bb);
      modules.push(m);
    }

    for (let i = 0; i < cfg.backbone.chain.length; i++) {
      const io = cfg.backbone.chain[i];
      log.log(`chaining ${io[0]} => ${io[1]}`);
      bb.chain(io[0], io[1]);
    }

    bb.emit(cfg.backbone.emit);

  } catch (err) {
    log.fatal(err);
  }

})();
