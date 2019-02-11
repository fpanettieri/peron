// previous position was closed
{ table: 'position',
  action: 'partial',
  keys: [ 'account', 'symbol', 'currency' ],
  types:
   { account: 'long',
     symbol: 'symbol',
     currency: 'symbol',
     underlying: 'symbol',
     quoteCurrency: 'symbol',
     commission: 'float',
     initMarginReq: 'float',
     maintMarginReq: 'float',
     riskLimit: 'long',
     leverage: 'float',
     crossMargin: 'boolean',
     deleveragePercentile: 'float',
     rebalancedPnl: 'long',
     prevRealisedPnl: 'long',
     prevUnrealisedPnl: 'long',
     prevClosePrice: 'float',
     openingTimestamp: 'timestamp',
     openingQty: 'long',
     openingCost: 'long',
     openingComm: 'long',
     openOrderBuyQty: 'long',
     openOrderBuyCost: 'long',
     openOrderBuyPremium: 'long',
     openOrderSellQty: 'long',
     openOrderSellCost: 'long',
     openOrderSellPremium: 'long',
     execBuyQty: 'long',
     execBuyCost: 'long',
     execSellQty: 'long',
     execSellCost: 'long',
     execQty: 'long',
     execCost: 'long',
     execComm: 'long',
     currentTimestamp: 'timestamp',
     currentQty: 'long',
     currentCost: 'long',
     currentComm: 'long',
     realisedCost: 'long',
     unrealisedCost: 'long',
     grossOpenCost: 'long',
     grossOpenPremium: 'long',
     grossExecCost: 'long',
     isOpen: 'boolean',
     markPrice: 'float',
     markValue: 'long',
     riskValue: 'long',
     homeNotional: 'float',
     foreignNotional: 'float',
     posState: 'symbol',
     posCost: 'long',
     posCost2: 'long',
     posCross: 'long',
     posInit: 'long',
     posComm: 'long',
     posLoss: 'long',
     posMargin: 'long',
     posMaint: 'long',
     posAllowance: 'long',
     taxableMargin: 'long',
     initMargin: 'long',
     maintMargin: 'long',
     sessionMargin: 'long',
     targetExcessMargin: 'long',
     varMargin: 'long',
     realisedGrossPnl: 'long',
     realisedTax: 'long',
     realisedPnl: 'long',
     unrealisedGrossPnl: 'long',
     longBankrupt: 'long',
     shortBankrupt: 'long',
     taxBase: 'long',
     indicativeTaxRate: 'float',
     indicativeTax: 'long',
     unrealisedTax: 'long',
     unrealisedPnl: 'long',
     unrealisedPnlPcnt: 'float',
     unrealisedRoePcnt: 'float',
     simpleQty: 'float',
     simpleCost: 'float',
     simpleValue: 'float',
     simplePnl: 'float',
     simplePnlPcnt: 'float',
     avgCostPrice: 'float',
     avgEntryPrice: 'float',
     breakEvenPrice: 'float',
     marginCallPrice: 'float',
     liquidationPrice: 'float',
     bankruptPrice: 'float',
     timestamp: 'timestamp',
     lastPrice: 'float',
     lastValue: 'long' },
  foreignKeys: { symbol: 'instrument' },
  attributes:
   { account: 'sorted',
     symbol: 'grouped',
     currency: 'grouped',
     underlying: 'grouped',
     quoteCurrency: 'grouped' },
  filter: { account: 153475 },
  data:
   [ { account: 153475,
       symbol: 'XBTUSD',
       currency: 'XBt',
       underlying: 'XBT',
       quoteCurrency: 'USD',
       commission: 0.00075,
       initMarginReq: 1,
       maintMarginReq: 0.005,
       riskLimit: 20000000000,
       leverage: 1,
       crossMargin: false,
       deleveragePercentile: null,
       rebalancedPnl: 0,
       prevRealisedPnl: -2483,
       prevUnrealisedPnl: 0,
       prevClosePrice: 3552,
       openingTimestamp: '2019-02-11T12:00:00.000Z',
       openingQty: 0,
       openingCost: 0,
       openingComm: 0,
       openOrderBuyQty: 0,
       openOrderBuyCost: 0,
       openOrderBuyPremium: 0,
       openOrderSellQty: 0,
       openOrderSellCost: 0,
       openOrderSellPremium: 0,
       execBuyQty: 0,
       execBuyCost: 0,
       execSellQty: 0,
       execSellCost: 0,
       execQty: 0,
       execCost: 0,
       execComm: 0,
       currentTimestamp: '2019-02-11T12:00:00.861Z',
       currentQty: 0,
       currentCost: 0,
       currentComm: 0,
       realisedCost: 0,
       unrealisedCost: 0,
       grossOpenCost: 0,
       grossOpenPremium: 0,
       grossExecCost: 0,
       isOpen: false,
       markPrice: null,
       markValue: 0,
       riskValue: 0,
       homeNotional: 0,
       foreignNotional: 0,
       posState: '',
       posCost: 0,
       posCost2: 0,
       posCross: 0,
       posInit: 0,
       posComm: 0,
       posLoss: 0,
       posMargin: 0,
       posMaint: 0,
       posAllowance: 0,
       taxableMargin: 0,
       initMargin: 0,
       maintMargin: 0,
       sessionMargin: 0,
       targetExcessMargin: 0,
       varMargin: 0,
       realisedGrossPnl: 0,
       realisedTax: 0,
       realisedPnl: 0,
       unrealisedGrossPnl: 0,
       longBankrupt: 0,
       shortBankrupt: 0,
       taxBase: 0,
       indicativeTaxRate: 0,
       indicativeTax: 0,
       unrealisedTax: 0,
       unrealisedPnl: 0,
       unrealisedPnlPcnt: 0,
       unrealisedRoePcnt: 0,
       simpleQty: null,
       simpleCost: null,
       simpleValue: null,
       simplePnl: null,
       simplePnlPcnt: null,
       avgCostPrice: null,
       avgEntryPrice: null,
       breakEvenPrice: null,
       marginCallPrice: null,
       liquidationPrice: null,
       bankruptPrice: null,
       timestamp: '2019-02-11T12:00:00.861Z',
       lastPrice: null,
       lastValue: 0 } ] }


// Manualy entered an order for 100 usd
{ table: 'position',
 action: 'update',
 data:
  [ { account: 153475,
      symbol: 'XBTUSD',
      currency: 'XBt',
      openOrderSellQty: 100,
      openOrderSellCost: -2790600,
      grossOpenCost: 2790600,
      riskValue: 2790600,
      initMargin: 2796879,
      timestamp: '2019-02-11T12:02:37.619Z',
      currentQty: 0,
      markPrice: null,
      liquidationPrice: null } ] }


// cancelled my order
{ table: 'position',
  action: 'update',
  data:
   [ { account: 153475,
       symbol: 'XBTUSD',
       currency: 'XBt',
       openOrderSellQty: 0,
       openOrderSellCost: 0,
       grossOpenCost: 0,
       riskValue: 0,
       initMargin: 0,
       timestamp: '2019-02-11T12:05:26.607Z',
       currentQty: 0,
       markPrice: null,
       liquidationPrice: null } ] }

// created a long order for 100 usd
{ table: 'position',
 action: 'update',
 data:
  [ { account: 153475,
      symbol: 'XBTUSD',
      currency: 'XBt',
      openOrderBuyQty: 100,
      openOrderBuyCost: -2791300,
      grossOpenCost: 2791300,
      riskValue: 2791300,
      initMargin: 2797581,
      timestamp: '2019-02-11T12:05:34.624Z',
      currentQty: 0,
      markPrice: null,
      liquidationPrice: null } ] }

// order got filled
{ table: 'position',
  action: 'update',
  data:
   [ { account: 153475,
       symbol: 'XBTUSD',
       currency: 'XBt',
       openOrderBuyQty: 0,
       openOrderBuyCost: 0,
       execBuyQty: 100,
       execBuyCost: 2791300,
       execQty: 100,
       execCost: -2791300,
       execComm: -697,
       currentTimestamp: '2019-02-11T12:06:04.178Z',
       currentQty: 100,
       currentCost: -2791300,
       currentComm: -697,
       unrealisedCost: -2791300,
       grossOpenCost: 0,
       grossExecCost: 2791300,
       isOpen: true,
       markPrice: 3538.5,
       markValue: -2826100,
       riskValue: 2826100,
       homeNotional: 0.028261,
       foreignNotional: -100,
       posCost: -2791300,
       posCost2: -2791300,
       posInit: 2791300,
       posComm: 4187,
       posMargin: 2795487,
       posMaint: 18144,
       initMargin: 0,
       maintMargin: 2760687,
       realisedPnl: 697,
       unrealisedGrossPnl: -34800,
       unrealisedPnl: -34800,
       unrealisedPnlPcnt: -0.0125,
       unrealisedRoePcnt: -0.0125,
       avgCostPrice: 3582.5,
       avgEntryPrice: 3582.5,
       breakEvenPrice: 3582,
       marginCallPrice: 1796,
       liquidationPrice: 1796,
       bankruptPrice: 1791.5,
       timestamp: '2019-02-11T12:06:04.178Z',
       lastPrice: 3538.5,
       lastValue: -2826100 } ] } 
