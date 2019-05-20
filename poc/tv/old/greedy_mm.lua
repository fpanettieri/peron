//@version=3

strategy("GREEDY MM", overlay=true)

// === INPUT ===
period = input(20, minval=1)
month = input(defval = 9, title = "From Month", minval = 1, maxval = 12)
day   = input(defval = 1, title = "From Day", minval = 1, maxval = 31)
year  = input(defval = 2018, title = "From Year", minval = 2017)

// === PARAMS ===
basis = sma(close, period)
start = timestamp(year, month, day, 00, 00)

// === EXECUTION ===
strategy.entry("L", strategy.long, when = close < basis and time > start)
strategy.close("L", when = high > basis)

strategy.entry("S", strategy.short, when = close > basis and time > start)
strategy.close("S", when = low < basis)

// === PLOT ===
plot(basis, color=white, title='ma')
