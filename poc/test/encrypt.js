'use strict';

const crypto = require('crypto');
const assert = require('assert');

const premade = 'POST/api/v1/order1518064238{"symbol":"XBTM15","price":219.0,"clOrdID":"mm_bitmex_1a/oemUeQ4CAJZgP3fjHsA","orderQty":98}';

const signature = crypto.createHmac('sha256', process.env.BITMEX_SECRET).update(premade).digest('hex');
const expected = '1749cd2ccae4aa49048ae09f0b95110cee706e0944e6a14ad0b3a8cb45bd336b';

assert(signature == expected);
