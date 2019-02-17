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
strategy.entry("L", strategy.long, when = crossover(close, lower))
strategy.close("L", when = crossunder(low, basis))

strategy.entry("S", strategy.short, when = crossunder(close, upper))
strategy.close("S", when = crossover(high, basis))

// === PLOT ===
plot(basis, color=red)
p1 = plot(upper, color=blue)
p2 = plot(lower, color=blue)
fill(p1, p2)
