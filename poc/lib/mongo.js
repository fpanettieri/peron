'use strict';

const mongodb = require('mongodb');

const logger = include('lib/logger');
const log = new logger('lib/mongo');

const cfg = include('cfg/mongo.json');

async function connect (cb)
{
  log.log('initializing');

  let url = `${cfg.prefix}${cfg.credentials}${cfg.host}:${cfg.port}/${cfg.database}${cfg.options}`;
  log.log('connecting to', url);

  try {
    let client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
    log.log('connected successfully');
    return client.db(cfg.database);
  } catch (err) {
    log.fatal(err);
  }
}

module.exports = {
  connect: connect
};
