'use strict';

// --- Global setup ---
global.cfg = require(`${process.argv[2]}`);
global.base_dir = __dirname;
global.include = function (file) { return require(`${base_dir}/${file}`); }

// --- Global setup ---
const logger = include('lib/logger');
const utils = include('lib/utils');
const backbone = include('core/backbone');
const modules = [];

(async () => {
  if (cfg.cooldown === undefined) { cfg.cooldown = 0 };
  if (cfg.modules === undefined) { cfg.modules = [] };
  if (cfg.backbone === undefined) { cfg.backbone = {} };
  if (cfg.backbone.chain === undefined) { cfg.backbone.chain = [] };
  if (cfg.backbone.ignore === undefined) { cfg.backbone.ignore = [] };
  if (process.send === undefined) { process.send = function () {} };

  debugger;

  const log = new logger(cfg.name);
  const bb = new backbone();

  // FIXME: move to it's own module
  // Prevent flooding bitmex
  await utils.sleep(cfg.cooldown);

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
