'use strict';

const ws = require('ws');
const core = require('./core');
const logger = require('./logger');

const log = new logger(`[BitMEX/Peron]`);
const client = new ws('wss://testnet.bitmex.com/realtime');
core.init(client, log);

client.on('open', core.open);
client.on('message', core.dispatch);
client.on('close', core.close);
client.on('error', core.error);

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
