'use strict';

const ws = require('ws');
const core = require('./core');
const logger = require('./logger');

const log = new logger(`[BitMEX/Peron]`);
const client = new ws('wss://testnet.bitmex.com/realtime');
core.init(client, log);

client.on('open', core.open);
client.on('message', core.dispatch);
client.on('close', core.close);
client.on('error', core.error);
