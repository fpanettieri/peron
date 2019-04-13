//@version=3

strategy("BB NTZ MM", overlay=true)

// === INPUT ===
period = input(20, minval=1)
year  = input(defval = 2019, title = "From Year", minval = 2017)
month = input(defval = 4, title = "From Month", minval = 1, maxval = 12)
day   = input(defval = 12, title = "From Day", minval = 1, maxval = 31)

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
