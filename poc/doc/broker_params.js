{
  symbol: ${cfg.symbol},
  side: 'Sell',
  orderQty: 1,
  price: 3000, // Magic, find best possible price
  timeInForce: 'GoodTillCancel',
  clOrdID: `ag-asdasd13`, // Track orders on the broker
  ordType: 'Limit',
  execInst: 'ParticipateDoNotInitiate'
}


ParticipateDoNotInitiate: If this order would have executed on placement, it will cancel instead.

curl -X POST --header 'Content-Type: application/x-www-form-urlencoded' --header 'Accept: application/json' --header 'X-Requested-With: XMLHttpRequest' -d 'symbol=XBTUSD&side=Buy&orderQty=1&price=3000&clOrdID=ag-1231231c&ordType=Limit&timeInForce=GoodTillCancel&execInst=ParticipateDoNotInitiate' 'https://testnet.bitmex.com/api/v1/order'
