//@version=3

strategy("BB MR", overlay=true, pyramiding=50, default_qty_type=strategy.percent_of_equity, default_qty_value=2)

// === INPUT GENERAL ===
period    = input(20, minval=1)
src       = input(close, title="Source")

// === INPUT TIME ===
year      = input(defval = 2019, title = "Year", minval = 2017)
month     = input(defval = 5, title = "Month", minval = 1, maxval = 12)
day       = input(defval = 20, title = "Day", minval = 1, maxval = 31)

// === INPUT BB ===
mul       = input(0.5, minval = 0.001, maxval = 50)
sl        = input(1.0, title='Stop Loss %', type=float) / 100

// === PARAMS TIME ===
basis     = sma(src, period)
start     = timestamp(year, month, day, 00, 00)
finish    = timestamp(year, month, day, 23, 59)
window()  => time >= start and time <= finish ? true : false

// === PARAMS BB ===
dev = mul * stdev(src, period)
upper = basis + dev
lower = basis - dev

// === EXECUTION ===
strategy.entry("L", strategy.long, when = window() and close < lower, stop = strategy.position_avg_price * (1 - sl))
strategy.exit("L", when = crossover(close, basis))

strategy.entry("S", strategy.short, when = window() and close > upper, stop = strategy.position_avg_price * (1 + sl))
strategy.exit("S", when = crossunder(close, basis))

// === PLOT ===
plot(basis, color=red, title='ma')

p1 = plot(upper, color=blue)
p2 = plot(lower, color=blue)
fill(p1, p2)
