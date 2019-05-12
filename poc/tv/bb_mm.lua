//@version=3
// Bollinger Bands Reentry

strategy("BB RE", overlay=true)

// === INPUT GENERAL ===
period  = input(20, minval=1)
bb_mul  = input(1.7, minval = 0.001, maxval = 50)
sl      = input(1.0, title='Stop Loss %', type=float) / 100

// === PARAMS BB ===
basis  = sma(close, period)
bb_dev = bb_mul * stdev(close, period)
upper  = basis + bb_dev
lower  = basis - bb_dev

// === EXECUTION ===
strategy.entry("L", strategy.long, when = close < lower and close < basis , stop = strategy.position_avg_price * (1 - sl))
strategy.close("L", when = crossunder(close, upper))

strategy.entry("S", strategy.short, when = close > upper and close > basis, stop = strategy.position_avg_price * (1 + sl))
strategy.close("S", when = crossover(close, lower))

// === PLOT ===
plot(basis, color=red, title='ma')

p1 = plot(upper, color=blue)
p2 = plot(lower, color=blue)
fill(p1, p2)
