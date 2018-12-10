const ws = require('ws')
const https = require('https')
const fs = require('fs')

const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}

const server = https.createServer(httpsOptions);
server.listen(8443);

const wss = new ws.Server({ server: server });

wss.on('connection', function connection(ws) {
  console.log('Connection stablished');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    ws.send('reply from server: ' + message);
  });

  ws.send('something');
});
