//@version=3

strategy("BB MM", overlay=true)

// Revision:        1
// Author:          @getplatita

// === INPUT ===
period = input(20, minval=1)
bb_mult = input(2, minval=0.001, maxval=50)
sl_mult = input(2, minval=0.001, maxval=50)

// === PARAMS ===
basis = sma(close, period)
bb_dev = bb_mult * stdev(close, period)
bb_upper = basis + bb_dev
bb_lower = basis - bb_dev

// === STOP LOSS ===
sl_dev = sl_mult * stdev(close, period)
sl_upper = basis + sl_dev
sl_lower = basis - sl_dev

// === EXECUTION ===
strategy.entry("L", strategy.long, when = crossover(close, bb_lower) and close < basis)
strategy.close("L", when = crossover(high, basis) or crossover(high, bb_upper))

strategy.entry("S", strategy.short, when = crossunder(close, bb_upper) and close > basis)
strategy.close("S", when = crossunder(low, basis) or crossunder(low, bb_lower))

// === PLOT ===
plot(basis, color=red)
p1 = plot(bb_upper, color=blue)
p2 = plot(bb_lower, color=blue)
fill(p1, p2)
