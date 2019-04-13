//@version=3

strategy("BB NTZ MM", overlay=true)

// === INPUT GENERAL ===
period      = input(20, minval=1)
src         = input(close, title="Source")

// === INPUT TIME ===
from_year   = input(defval = 2019, title = "From Year", minval = 2017)
from_month  = input(defval = 4, title = "From Month", minval = 1, maxval = 12)
from_day    = input(defval = 10, title = "From Day", minval = 1, maxval = 31)

to_year     = input(defval = 2019, title = "To Year", minval = 2017)
to_month    = input(defval = 4, title = "To Month", minval = 1, maxval = 12)
to_day      = input(defval = 11, title = "To Day", minval = 1, maxval = 31)

// === INPUT BB ===
bb_mul  = input(2.0, minval=0.001, maxval=50)
ntz_mul = input(0.7, minval=0.001, maxval=50)

// === PARAMS TIME ===
basis     = sma(src, period)
start     = timestamp(from_year, from_month, from_day, 00, 00)
finish    = timestamp(to_year, to_month, to_day, 23, 59)
window()  => time >= start and time <= finish ? true : false

// === PARAMS BB ===
bb_dev = bb_mul * stdev(src, period)
nt_dev = ntz_mul * stdev(src, period)

upper = basis + bb_dev
lower = basis - bb_dev

ntz_up = basis + nt_dev
ntz_low = basis - nt_dev

// === EXECUTION ===
strategy.entry("L", strategy.long, when = window() and close < ntz_low)
strategy.close("L", when = crossover(close, ntz_low))

strategy.entry("S", strategy.short, when = window() and close > ntz_up)
strategy.close("S", when = crossover(close, ntz_up))

// === PLOT ===
plot(basis, color=red, title='ma')

p1 = plot(upper, color=blue)
p2 = plot(lower, color=blue)
fill(p1, p2)

ntp1 = plot(ntz_up, color=gray)
ntp2 = plot(ntz_low, color=gray)
fill(ntp1, ntp2, color=gray)
