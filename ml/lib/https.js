'use strict';

const https = require('https');
const url = require('url');
const logger = require('./logger');

const log = new logger(`[lib/https]`);

async function get (url, opts)
{
  const req = https.request(options);
  return {a: 'a'};
}


async function post (url,)
{

}

module.exports = {
  get: get,
  post: post
}
