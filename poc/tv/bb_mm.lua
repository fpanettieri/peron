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
long = crossover(close, lower)
short = crossunder(close, upper)
exit = cross(close, basis)

if (crossover(close, lower))
    strategy.entry("BBandLE", strategy.long, stop=lower, oca_name="BollingerBands", oca_type=strategy.oca.cancel, comment="BBandLE")
else
    strategy.cancel(id="BBandLE")

if (crossunder(close, upper))
    strategy.entry("BBandSE", strategy.short, stop=upper, oca_name="BollingerBands", oca_type=strategy.oca.cancel, comment="BBandSE")
else
    strategy.cancel(id="BBandSE")

plot(basis, color=red)
p1 = plot(upper, color=blue)
p2 = plot(lower, color=blue)
fill(p1, p2)
