'use strict';

const crypto = require('crypto');
const assert = require('assert');

const key = process.env.BITMEX_KEY
const secret = process.env.BITMEX_SECRET

const method = 'POST';
const path = '/api/v1/order';
const expires = 1580526000;
const data = 'symbol=XBTUSD&side=Buy&orderQty=1&price=3000&clOrdID=ag-1231231cx&ordType=Limit&timeInForce=GoodTillCancel&execInst=ParticipateDoNotInitiate';

const unsigned = `${method}${path}${expires}${data}`;

const signature = crypto.createHmac('sha256', secret).update(unsigned).digest('hex');
const expected = '1749cd2ccae4aa49048ae09f0b95110cee706e0944e6a14ad0b3a8cb45bd336b';

// assert(signature == expected);
console.log('signature', signature);
console.log('expected', expected);

// 'POST/api/v1/order1518064238{"symbol":"XBTM15","price":219.0,"clOrdID":"mm_bitmex_1a/oemUeQ4CAJZgP3fjHsA","orderQty":98}';
// 'POST/api/v1/order1551048809{"symbol":"XBTUSD","side":"Buy","orderQty":1,"timeInForce":"GoodTillCancel","clOrdID":"ag-i61ibcyf","ordType":"Limit","price":3000,"execInst":"ParticipateDoNotInitiate"}'
