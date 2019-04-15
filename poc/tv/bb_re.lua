//@version=3
// Bollinger Bands Reentry

strategy("BB RE", overlay=true)

// === INPUT GENERAL ===
period  = input(20, minval=1)
src     = input(close, title="Source")
bb_mul  = input(1.7, minval = 0.001, maxval = 50)
sl      = input(1.0, title='Stop Loss %', type=float) / 100

// === PARAMS BB ===
basis  = sma(src, period)
bb_dev = bb_mul * stdev(src, period)
upper  = basis + bb_dev
lower  = basis - bb_dev

// === EXECUTION ===
strategy.entry("L", strategy.long, when = crossover(src, lower) and src < basis, stop = strategy.position_avg_price * (1 - sl))
strategy.close("L", when = crossover(src, upper))

strategy.entry("S", strategy.short, when = crossunder(src, upper) and src > basis, stop = strategy.position_avg_price * (1 + sl))
strategy.close("S", when = crossunder(src, lower))

// === PLOT ===
plot(basis, color=red, title='ma')

p1 = plot(upper, color=blue)
p2 = plot(lower, color=blue)
fill(p1, p2)
