//@version=3

strategy("BB NTZ MM", overlay=true, pyramiding=50, default_qty_type=strategy.percent_of_equity, default_qty_value=2)

// === INPUT GENERAL ===
period      = input(20, minval=1)
src         = input(close, title="Source")

// === INPUT TIME ===
from_year   = input(defval = 2019, title = "From Year", minval = 2017)
from_month  = input(defval = 5, title = "From Month", minval = 1, maxval = 12)
from_day    = input(defval = 10, title = "From Day", minval = 1, maxval = 31)

// === INPUT BB ===
bb_mul  = input(2.0, minval = 0.001, maxval = 50)
ntz_mul = input(0.7, minval = 0.001, maxval = 50)
sl      = input(1.0, title='Stop Loss %', type=float) / 100

// === PARAMS TIME ===
basis     = sma(src, period)
start     = timestamp(from_year, from_month, from_day, 00, 00)
finish    = timestamp(from_year, from_month, from_day, 23, 59)
window()  => time >= start and time <= finish ? true : false

// === PARAMS BB ===
bb_dev = bb_mul * stdev(src, period)
nt_dev = ntz_mul * stdev(src, period)

upper = basis + bb_dev
lower = basis - bb_dev

ntz_up = basis + nt_dev
ntz_low = basis - nt_dev

// === EXECUTION ===
strategy.entry("L", strategy.long, when = window() and close < ntz_low, stop = strategy.position_avg_price * (1 - sl))
strategy.exit("L", when = crossover(close, basis))

strategy.entry("S", strategy.short, when = window() and close > ntz_up, stop = strategy.position_avg_price * (1 + sl))
strategy.exit("S", when = crossunder(close, basis))

// === PLOT ===
plot(basis, color=red, title='ma')

p1 = plot(upper, color=blue)
p2 = plot(lower, color=blue)
fill(p1, p2)

ntp1 = plot(ntz_up, color=gray)
ntp2 = plot(ntz_low, color=gray)
fill(ntp1, ntp2, color=gray)
