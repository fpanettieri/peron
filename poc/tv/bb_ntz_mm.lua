//@version=3

strategy("BB NTZ MM", overlay=true)

// === INPUT ===
period  = input(20, minval=1)
year    = input(defval = 2019, title = "From Year", minval = 2017)
month   = input(defval = 4, title = "From Month", minval = 1, maxval = 12)
day     = input(defval = 12, title = "From Day", minval = 1, maxval = 31)
src     = input(close, title="Source")
bb_mul  = input(2.0, minval=0.001, maxval=50)
ntz_mul = input(0.7, minval=0.001, maxval=50)

// === PARAMS ===
basis = sma(src, period)
start = timestamp(year, month, day, 00, 00)

// === EXECUTION ===
strategy.entry("L", strategy.long, when = close < basis and time > start)
strategy.close("L", when = high > basis)

strategy.entry("S", strategy.short, when = close > basis and time > start)
strategy.close("S", when = low < basis)

// === PLOT ===
plot(basis, color=red, title='ma')

p1 = plot(upper, color=blue)
p2 = plot(lower, color=blue)
fill(p1, p2)

ntp1 = plot(ntz_up, color=gray)
ntp2 = plot(ntz_low, color=gray)
fill(ntp1, ntp2, color=gray)
