//@version=3
// Bollinger Bands Reentry with No Trade Zone

strategy("BB NTZ RE", overlay=true)

// === INPUT GENERAL ===
period      = input(20, minval=1)
src         = input(close, title="Source")

// === INPUT BB ===
bb_mul  = input(1.7, minval = 0.001, maxval = 50)
ntz_mul = input(0.7, minval = 0.001, maxval = 50)

// === PARAMS BB ===
basis  = sma(src, period)
bb_dev = bb_mul * stdev(src, period)
nt_dev = ntz_mul * stdev(src, period)

upper = basis + bb_dev
lower = basis - bb_dev

ntz_up = basis + nt_dev
ntz_low = basis - nt_dev

// === EXECUTION ===
strategy.entry("L", strategy.long, when = crossover(src, lower) and src < ntz_low)
strategy.close("L", when = crossover(src, upper))

strategy.entry("S", strategy.short, when = crossunder(src, upper) and src > ntz_up)
strategy.close("S", when = crossunder(src, lower))

// === PLOT ===
plot(basis, color=red, title='ma')

p1 = plot(upper, color=blue)
p2 = plot(lower, color=blue)
fill(p1, p2)

ntp1 = plot(ntz_up, color=gray)
ntp2 = plot(ntz_low, color=gray)
fill(ntp1, ntp2, color=gray)
