const express = require('express')
const https = require('https')
const fs = require('fs')

const app = express();
const port = 3000;

const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}

const server = https.createServer(httpsOptions, app).listen(port, () => {
  console.log('server running at ' + port)
})

app.get('/', function (req, res) {
  res.header('Content-type', 'text/html');
  return res.end('<h1>Hello, Secure World!</h1>');
});
