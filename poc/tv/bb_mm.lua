//@version=3

strategy("BB MM", overlay=true)

// Revision:        1
// Author:          @getplatita

// === INPUT ===
period = input(20, minval=1)
mult = input(2, minval=0.001, maxval=50)

// === PARAMS ===
basis = sma(close, period)
dev = mult * stdev(close, period)
upper = basis + dev
lower = basis - dev

// === EXECUTION ===
strategy.entry("L", strategy.long, when = crossover(close, lower) and close < basis)
strategy.close("L", when = crossover(high, basis) or crossover(high, upper))

strategy.entry("S", strategy.short, when = crossunder(close, upper) and close > basis)
strategy.close("S", when = crossunder(low, basis) or crossunder(low, lower))

// === PLOT ===
plot(basis, color=red)
p1 = plot(upper, color=blue)
p2 = plot(lower, color=blue)
fill(p1, p2)
