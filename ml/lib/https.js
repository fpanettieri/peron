'use strict';

const https = require('https');
const url = require('url');
const logger = require('./logger');

const log = new logger(`[lib/https]`);

async function get (_url, opts)
{
  const u = url.parse(_url);
  log.log('parsed url', u);
  const req = https.request(options);
  return {a: 'a'};
}


async function post (url, data, opts)
{

}

module.exports = {
  get: get,
  post: post
}
