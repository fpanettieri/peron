'use strict';

const crypto = require('crypto');
const assert = require('assert');

const key = process.env.BITMEX_KEY
const secret = process.env.BITMEX_SECRET

const method = 'DELETE';
const path = '/api/v1/order';
const expires = 1580526000;
const data = 'clOrdID=ag-yyrljifl';

const unsigned = `${method}${path}${expires}${data}`;

const signature = crypto.createHmac('sha256', secret).update(unsigned).digest('hex');
const expected = '1749cd2ccae4aa49048ae09f0b95110cee706e0944e6a14ad0b3a8cb45bd336b';

// assert(signature == expected);
console.log('signature', signature);
console.log('expected', expected);
