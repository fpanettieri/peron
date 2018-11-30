const express = require('express')
const https = require('https')
const fs = require('fs')

const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}
const server = https.createServer(httpsOptions, app).listen(port, () => {
  console.log('server running at ' + port)
})
