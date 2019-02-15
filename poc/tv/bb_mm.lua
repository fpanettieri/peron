//@version=3
strategy("Bollinger Bands Market Maker", overlay=true)

longCondition = crossover(sma(close, 14), sma(close, 28))
if (longCondition)
  strategy.entry("My Long Entry Id", strategy.long)

shortCondition = crossunder(sma(close, 14), sma(close, 28))
if (shortCondition)
  strategy.entry("My Short Entry Id", strategy.short)
