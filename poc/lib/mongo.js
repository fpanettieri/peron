'use strict';

const mongodb = require('mongodb');

const cfg = require('../cfg/mongo.json');

const Logger = require('./logger');
const logger = new Logger('[lib/mongo]');

async function connect (cb)
{
  let url = `${cfg.prefix}${cfg.credentials}${cfg.host}:${cfg.port}/${cfg.database}${cfg.options}`;
  logger.info('connecting to', url);

  try {
    let client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
    logger.info('connected successfully');

    const db = client.db(cfg.database);
    return db;

  } catch (err) {
    logger.log(err);
  }
}

module.exports = {
  connect: connect
}
