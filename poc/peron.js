const WebSocket = require('ws');

const ENDPOINT = 'wss://testnet.bitmex.com/realtime';

const ws = new WebSocket(ENDPOINT);

function noop (){}

ws.on('open', function open() {

  try {
    let str = JSON.stringify('help');
    ws.send(str, function ack(error) {
      // If error is not defined, the send has been completed, otherwise the error
      // object will indicate what failed.
      console.error('SERVER ERROR:');
      console.error(error);
    });
  } catch (e) {
    console.error('SEND FAILED:');
    console.error(e);
  }
});

ws.on('message', function incoming(data) {
  console.log(data);
});
