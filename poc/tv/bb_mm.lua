//@version=2
strategy("test")
if n>4000
    strategy.entry("buy", strategy.long, 10, when=strategy.position_size <= 0)
    strategy.entry("sell", strategy.short, 10, when=strategy.position_size > 0)
plot(strategy.equity)
