'use strict';

const mongodb = require('mongodb');

const logger = require('./logger');
const log = new logger('[lib/mongo]');

const cfg = require('../cfg/mongo.json');

async function connect (cb)
{
  log.info('initializing');

  let url = `${cfg.prefix}${cfg.credentials}${cfg.host}:${cfg.port}/${cfg.database}${cfg.options}`;
  log.info('connecting to', url);

  try {
    let client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
    log.info('connected successfully');
    return client.db(cfg.database);
  } catch (err) {
    log.log(err);
  }
}

module.exports = {
  connect: connect
}
