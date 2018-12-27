{ table: 'instrument',
  action: 'partial',
  keys: [ 'symbol' ],
  types:
   { symbol: 'symbol',
     rootSymbol: 'symbol',
     state: 'symbol',
     typ: 'symbol',
     listing: 'timestamp',
     front: 'timestamp',
     expiry: 'timestamp',
     settle: 'timestamp',
     relistInterval: 'timespan',
     inverseLeg: 'symbol',
     sellLeg: 'symbol',
     buyLeg: 'symbol',
     optionStrikePcnt: 'float',
     optionStrikeRound: 'float',
     optionStrikePrice: 'float',
     optionMultiplier: 'float',
     positionCurrency: 'symbol',
     underlying: 'symbol',
     quoteCurrency: 'symbol',
     underlyingSymbol: 'symbol',
     reference: 'symbol',
     referenceSymbol: 'symbol',
     calcInterval: 'timespan',
     publishInterval: 'timespan',
     publishTime: 'timespan',
     maxOrderQty: 'long',
     maxPrice: 'float',
     lotSize: 'long',
     tickSize: 'float',
     multiplier: 'long',
     settlCurrency: 'symbol',
     underlyingToPositionMultiplier: 'long',
     underlyingToSettleMultiplier: 'long',
     quoteToSettleMultiplier: 'long',
     isQuanto: 'boolean',
     isInverse: 'boolean',
     initMargin: 'float',
     maintMargin: 'float',
     riskLimit: 'long',
     riskStep: 'long',
     limit: 'float',
     capped: 'boolean',
     taxed: 'boolean',
     deleverage: 'boolean',
     makerFee: 'float',
     takerFee: 'float',
     settlementFee: 'float',
     insuranceFee: 'float',
     fundingBaseSymbol: 'symbol',
     fundingQuoteSymbol: 'symbol',
     fundingPremiumSymbol: 'symbol',
     fundingTimestamp: 'timestamp',
     fundingInterval: 'timespan',
     fundingRate: 'float',
     indicativeFundingRate: 'float',
     rebalanceTimestamp: 'timestamp',
     rebalanceInterval: 'timespan',
     openingTimestamp: 'timestamp',
     closingTimestamp: 'timestamp',
     sessionInterval: 'timespan',
     prevClosePrice: 'float',
     limitDownPrice: 'float',
     limitUpPrice: 'float',
     bankruptLimitDownPrice: 'float',
     bankruptLimitUpPrice: 'float',
     prevTotalVolume: 'long',
     totalVolume: 'long',
     volume: 'long',
     volume24h: 'long',
     prevTotalTurnover: 'long',
     totalTurnover: 'long',
     turnover: 'long',
     turnover24h: 'long',
     homeNotional24h: 'float',
     foreignNotional24h: 'float',
     prevPrice24h: 'float',
     vwap: 'float',
     highPrice: 'float',
     lowPrice: 'float',
     lastPrice: 'float',
     lastPriceProtected: 'float',
     lastTickDirection: 'symbol',
     lastChangePcnt: 'float',
     bidPrice: 'float',
     midPrice: 'float',
     askPrice: 'float',
     impactBidPrice: 'float',
     impactMidPrice: 'float',
     impactAskPrice: 'float',
     hasLiquidity: 'boolean',
     openInterest: 'long',
     openValue: 'long',
     fairMethod: 'symbol',
     fairBasisRate: 'float',
     fairBasis: 'float',
     fairPrice: 'float',
     markMethod: 'symbol',
     markPrice: 'float',
     indicativeTaxRate: 'float',
     indicativeSettlePrice: 'float',
     optionUnderlyingPrice: 'float',
     settledPrice: 'float',
     timestamp: 'timestamp' },
  foreignKeys:
   { inverseLeg: 'instrument',
     sellLeg: 'instrument',
     buyLeg: 'instrument' },
  attributes: { symbol: 'unique' },
  filter: { symbol: 'XBTUSD' },
  data:
   [ { symbol: 'XBTUSD',
       rootSymbol: 'XBT',
       state: 'Open',
       typ: 'FFWCSX',
       listing: '2016-05-04T12:00:00.000Z',
       front: '2016-05-04T12:00:00.000Z',
       expiry: null,
       settle: null,
       relistInterval: null,
       inverseLeg: '',
       sellLeg: '',
       buyLeg: '',
       optionStrikePcnt: null,
       optionStrikeRound: null,
       optionStrikePrice: null,
       optionMultiplier: null,
       positionCurrency: 'USD',
       underlying: 'XBT',
       quoteCurrency: 'USD',
       underlyingSymbol: 'XBT=',
       reference: 'BMEX',
       referenceSymbol: '.BXBT',
       calcInterval: null,
       publishInterval: null,
       publishTime: null,
       maxOrderQty: 10000000,
       maxPrice: 1000000,
       lotSize: 1,
       tickSize: 0.5,
       multiplier: -100000000,
       settlCurrency: 'XBt',
       underlyingToPositionMultiplier: null,
       underlyingToSettleMultiplier: -100000000,
       quoteToSettleMultiplier: null,
       isQuanto: false,
       isInverse: true,
       initMargin: 0.01,
       maintMargin: 0.005,
       riskLimit: 20000000000,
       riskStep: 10000000000,
       limit: null,
       capped: false,
       taxed: true,
       deleverage: true,
       makerFee: -0.00025,
       takerFee: 0.00075,
       settlementFee: 0,
       insuranceFee: 0,
       fundingBaseSymbol: '.XBTBON8H',
       fundingQuoteSymbol: '.USDBON8H',
       fundingPremiumSymbol: '.XBTUSDPI8H',
       fundingTimestamp: '2018-12-27T04:00:00.000Z',
       fundingInterval: '2000-01-01T08:00:00.000Z',
       fundingRate: -0.00375,
       indicativeFundingRate: -0.00375,
       rebalanceTimestamp: null,
       rebalanceInterval: null,
       openingTimestamp: '2018-12-26T23:00:00.000Z',
       closingTimestamp: '2018-12-27T00:00:00.000Z',
       sessionInterval: '2000-01-01T01:00:00.000Z',
       prevClosePrice: 3753.64,
       limitDownPrice: null,
       limitUpPrice: null,
       bankruptLimitDownPrice: null,
       bankruptLimitUpPrice: null,
       prevTotalVolume: 101975110353,
       totalVolume: 101975486885,
       volume: 376532,
       volume24h: 22199779,
       prevTotalTurnover: 1488285085399922,
       totalTurnover: 1488295231585630,
       turnover: 10146185708,
       turnover24h: 598040612442,
       homeNotional24h: 5980.406124420001,
       foreignNotional24h: 22199779,
       prevPrice24h: 3711,
       vwap: 3712.0903,
       highPrice: 3785,
       lowPrice: 3652.5,
       lastPrice: 3720,
       lastPriceProtected: 3730,
       lastTickDirection: 'ZeroMinusTick',
       lastChangePcnt: 0.0024,
       bidPrice: 3720,
       midPrice: 3720.25,
       askPrice: 3720.5,
       impactBidPrice: 3701.9213,
       impactMidPrice: 3715,
       impactAskPrice: 3728.0048,
       hasLiquidity: false,
       openInterest: 79565443,
       openValue: 2087478962548,
       fairMethod: 'FundingRate',
       fairBasisRate: -4.10625,
       fairBasis: -8.15,
       fairPrice: 3811.56,
       markMethod: 'FairPrice',
       markPrice: 3811.56,
       indicativeTaxRate: 0,
       indicativeSettlePrice: 3819.71,
       optionUnderlyingPrice: null,
       settledPrice: null,
       timestamp: '2018-12-26T23:27:25.000Z' } ] }
