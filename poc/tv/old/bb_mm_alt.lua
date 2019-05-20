//@version=3

strategy("BB MM Alt", overlay=true)

// === INPUT ===
period = input(20, minval=1)
mult = input(2, minval=0.001, maxval=50)

// === PARAMS ===
basis = sma(close, period)
dev = mult * stdev(close, period)
upper = basis + dev
lower = basis - dev

// === EXECUTION ===
strategy.entry("L", strategy.long, when = crossover(close, lower) and close < basis, stop = low * 1.05)
strategy.close("L", when = crossover(close, upper))

// === PLOT ===
plot(basis, color=white, title='ma')
p1 = plot(upper, color=white, title='upper')
p2 = plot(lower, color=white, title='lower')
fill(p1, p2)
