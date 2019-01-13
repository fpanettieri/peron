'use strict';


const logger = require('./logger');

const log = new logger(`[Deribit/Peron-ml]`);

log.log('api secret', process.env.DERIBIT_SECRET);
log.log('api key', process.env.DERIBIT_KEY);
