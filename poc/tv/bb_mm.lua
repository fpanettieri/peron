//@version=3

strategy("BB MM", overlay=true)

// === INPUT ===
period = input(20, minval=1)
mult = input(2, minval=0.001, maxval=50)

// === PARAMS ===
basis = ma(close, period)
dev = mult * stdev(close, period)
upper = basis + dev
lower = basis - dev

// === EXECUTION ===
strategy.entry("L", strategy.long, when = crossover(close, lower) and close < basis)
strategy.close("L", when = high > basis)

strategy.entry("S", strategy.short, when = crossunder(close, upper) and close > basis)
strategy.close("S", when = low < basis)

// === PLOT ===
plot(basis, color=red, title='ma')
p1 = plot(upper, color=blue, title='upper')
p2 = plot(lower, color=blue, title='lower')
fill(p1, p2)
