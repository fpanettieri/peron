'use strict';

const ws = require('ws');
// const ws = require('./dispatcher');

const client = new ws('wss://testnet.bitmex.com/realtime');

client.on('open', (a, b, c) => {
  console.log('[Peron.open]');
  console.log('a', a);
  console.log('b', b);
  console.log('c', c);
});

client.on('ping', (a) => {
  console.log('[Peron.ping]');
  console.log('a', a);
});

client.on('pong', (a) => {
  console.log('[Peron.pong]');
  console.log('a', a);
});

client.on('message', (a) => {
  console.log('[Peron.message]');
  console.log('a', a);
});

client.on('close', (a, b) => {
  console.log('[Peron.close]');
  console.log('a', a);
  console.log('b', b);
});

client.on('error', (e) => {
  console.log(e);
});

//
//
// client.on('open', function open() {
//
//   try {
//     let str = JSON.stringify('help');
//     client.send(str, function ack(error) {
//       // If error is not defined, the send has been completed, otherwise the error
//       // object will indicate what failed.
//       console.error('SERVER ERROR:');
//       console.error(error);
//     });
//   } catch (e) {
//     console.error('SEND FAILED:');
//     console.error(e);
//   }
// });
//
// client.on('message', function incoming(data) {
//   console.log(data);
// });
//
//
// const client = new WebSocket('wss://echo.websocket.org/');
//
// client.on('open', heartbeat);
// client.on('ping', heartbeat);
// client.on('close', function clear() {
//   clearTimeout(this.pingTimeout);
// });
