// My liquidations

{ table: 'liquidation',
  action: 'partial',
  keys: [ 'orderID' ],
  types:
   { orderID: 'guid',
     symbol: 'symbol',
     side: 'symbol',
     price: 'float',
     leavesQty: 'long' },
  foreignKeys: { symbol: 'instrument', side: 'side' },
  attributes: { orderID: 'grouped' },
  filter: {},
  data: [] }
