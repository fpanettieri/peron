{ // Position
account: 153475,
symbol: 'XBTUSD',
currency: 'XBt',
underlying: 'XBT',
quoteCurrency: 'USD',
commission: 0.00075,
initMarginReq: 0.02,  // no idea
maintMarginReq: 0.005,  // ???
riskLimit: 20000000000,
leverage: 50, // Trader can validate this
crossMargin: false, // Trader can validate this
deleveragePercentile: 1,
rebalancedPnl: 22587931,
prevRealisedPnl: -22587931,
prevUnrealisedPnl: 0,
prevClosePrice: 3907,
openingTimestamp: '2019-02-21T02:00:00.000Z',
openingQty: 363,
openingCost: -19161348,
openingComm: 32482115,
openOrderBuyQty: 0,
openOrderBuyCost: 0,
openOrderBuyPremium: 0,
openOrderSellQty: 0,
openOrderSellCost: 0,
openOrderSellPremium: 0,
execBuyQty: 209637,
execBuyCost: 5338406205,
execSellQty: 0,
execSellCost: 0,
execQty: 209637,
execCost: -5338406205,
execComm: -1334597,
currentTimestamp: '2019-02-21T02:19:57.455Z',
currentQty: 210000,
currentCost: -5357567553,
currentComm: 31147518,
realisedCost: -9896499,
unrealisedCost: -5347671054,
grossOpenCost: 0,
grossOpenPremium: 0,
grossExecCost: 5338406205,
isOpen: true,             // KEY!
markPrice: 3907,
markValue: -5374950000,
riskValue: 5374950000,
homeNotional: 53.7495,
foreignNotional: -210000,
posState: '',
posCost: -5347671054,
posCost2: -5347671054,
posCross: 25920,
posInit: 106953422,
posComm: 4090988,
posLoss: 0,
posMargin: 111070330,
posMaint: 30829344,
posAllowance: 0,
taxableMargin: 0,
initMargin: 0,
maintMargin: 83791384,
sessionMargin: 0,
targetExcessMargin: 0,
varMargin: 0,
realisedGrossPnl: 9896499,
realisedTax: 0,
realisedPnl: -21251019,
unrealisedGrossPnl: -27278946,
longBankrupt: 0,
shortBankrupt: 0,
taxBase: 9870363,
indicativeTaxRate: 0,
indicativeTax: 0,
unrealisedTax: 0,
unrealisedPnl: -27278946,
unrealisedPnlPcnt: -0.0051,
unrealisedRoePcnt: -0.2551,
simpleQty: null,
simpleCost: null,
simpleValue: null,
simplePnl: null,
simplePnlPcnt: null,
avgCostPrice: 3926.9586,
avgEntryPrice: 3926.9586, // Important for the Broker
breakEvenPrice: 3926.5,
marginCallPrice: 3869,
liquidationPrice: 3869, // This is important, there is a HUGE difference between bankrupt and liquidation
bankruptPrice: 3850.5,
timestamp: '2019-02-21T02:19:57.455Z',
lastPrice: 3907,
lastValue: -5374950000 }

{ // Margin
account: 153475,
currency: 'XBt',
riskLimit: 1000000000000, // No idea
prevState: '',
state: '',
action: '',
amount: 146436490,
pendingCredit: 0,
pendingDebit: 0,
confirmedDebit: 0,
prevRealisedPnl: -22598939,
prevUnrealisedPnl: 0,
grossComm: 31147518,
grossOpenCost: 0,
grossOpenPremium: 0,
grossExecCost: 5338406205,  // Size of the position +
grossMarkValue: 5374950000, // Size of the position
riskValue: 5374950000,
taxableMargin: 0,
initMargin: 0,
maintMargin: 83791384,  // Margin allocated
sessionMargin: 0,
targetExcessMargin: 0,
varMargin: 0,
realisedPnl: -21251019,
unrealisedPnl: -27278946,
indicativeTax: 0,
unrealisedProfit: 0,
syntheticMargin: null,
walletBalance: 125185471, // Total wallet balance
marginBalance: 97906525,  // Wallet + Unrealised PNL (Trader can ignore this)
marginBalancePcnt: 0.0182,
marginLeverage: 54.898792496210035, // Important
marginUsedPcnt: 0.8558, // IMPORTANT (maybe the most important???)
excessMargin: 14115141,
excessMarginPcnt: 0.0026,
availableMargin: 14115141, // Available Margin (Traders CARES about this one)
withdrawableMargin: 14115141, // Ignore this
timestamp: '2019-02-21T02:19:57.458Z',
grossLastValue: 5374950000,
commission: null }
