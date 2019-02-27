//@version=3

strategy("BB MANUAL", overlay=true)

// === INPUT ===
period = input(24, minval=1)
mult = input(2, minval=0.001, maxval=50)

// === PARAMS ===
basis = sma(close, period)
dev = mult * stdev(close, period)
upper = basis + dev
lower = basis - dev

// === EXECUTION ===
buy = crossover(close, lower) and close < basis
sell = crossunder(close, upper) and close > basis

// === PLOT ===
plot(basis, color=white, title='ma')
p1 = plot(upper, color=white, title='upper')
p2 = plot(lower, color=white, title='lower')
fill(p1, p2)

plotshape(buy, color=green, location=location.belowbar, style=shape.arrowup, transp=10, text="Buy")
plotshape(sell, color=red, location=location.abovebar, style=shape.arrowdown, transp=10, text="Sell")
