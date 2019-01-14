'use strict';

const https = require('https');

async function send (url, data, opts)
{
  return new Promise(function(resolve, reject) {
    const req = https.request(url, opts);
    req.on('error', reject);
    req.once('response', (res) => {
      res.setEncoding('utf8');

      const out = {
        status: {code: res.statusCode, msg: res.statusMessage},
        headers: res.headers,
        body: ''
      };

      res.on('data', (chunk) => { out.body += chunk; });
      res.on('end', () => { resolve(out); });
    });

    if (data) { req.write(data); }
    req.end();
  });
}

async function get (url, opts)
{
  opts = opts || {};
  opts.method = 'GET';
  return send(url, null, opts);
}

async function post (url, data, opts)
{
  opts = opts || {};
  opts.method = 'POST';
  return send(url, data, opts);
}

module.exports = {
  send: send,
  get: get,
  post: post
}
