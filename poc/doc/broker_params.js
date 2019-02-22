{
  symbol: ${cfg.symbol},
  side: 'Sell',
  orderQty: 1,
  price: 3000, // Magic, find best possible price
  timeInForce: 'GoodTillCancel',
  clOrdID: 1, // Track orders on the broker
  ordType: 'Limit',
  execInst: 'ParticipateDoNotInitiate'
}


ParticipateDoNotInitiate: If this order would have executed on placement, it will cancel instead.
