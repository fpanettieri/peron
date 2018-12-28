// AKA OLHC Candles

{ table: 'quoteBin1m',
  action: 'partial',
  keys: [],
  types:
    { timestamp: 'timestamp',
      symbol: 'symbol',
      bidSize: 'long',
      bidPrice: 'float',
      askPrice: 'float',
      askSize: 'long' },
  foreignKeys: { symbol: 'instrument' },
  attributes: { timestamp: 'sorted', symbol: 'grouped' },
  filter: { symbol: 'XBTUSD' },
  data:
    [ { timestamp: '2018-12-28T15:41:00.000Z',
        symbol: 'XBTUSD',
        bidSize: 481,
        bidPrice: 3750,
        askPrice: 3750.5,
        askSize: 70259 } ] }
