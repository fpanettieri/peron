//@version=3

strategy("VIX MR", overlay=true, pyramiding=10, default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// === INPUT ===
ma_prd     = input(20, minval=1)
vix_prd    = input(20, minval=1)
min_vol    = input(1.0, title='Min Volatility', type=float)
max_vol    = input(2.0, title='Max Volatility', type=float)
sl         = input(1.0, title='Stop Loss %', type=float) / 100

// === INPUT TIME ===
year       = input(defval = 2019, title = "Year", minval = 2017)
month      = input(defval = 5, title = "Month", minval = 1, maxval = 12)
day        = input(defval = 20, title = "Day", minval = 1, maxval = 31)

// === TIME ===
start      = timestamp(year, month, day, 00, 00)
finish     = timestamp(year, month, day, 23, 59)
window()   => time >= start and time <= finish ? true : false

// === PARAMS ===
basis      = ema(close, ma_prd)
vix_top    = (high - lowest(close, vix_prd)) / (lowest(close, vix_prd)) * 100
vix_bot    = (highest(close, vix_prd) - low) / (highest(close, vix_prd)) * 100
open_long  = vix_bot >= min_vol and vix_bot < max_vol
open_short = vix_top >= min_vol and vix_top < max_vol

// === EXECUTION ===
strategy.entry("L", strategy.long, when = window() and close < basis and open_long, stop = strategy.position_avg_price * (1 - sl))
strategy.close("L", when = crossover(close, basis))

strategy.entry("S", strategy.short, when = window() and close > basis and open_short, stop = strategy.position_avg_price * (1 + sl))
strategy.close("S", when = crossunder(close, basis))

// === PLOT ===
plot(basis, color=#A84CB9, linewidth=3, transp=0, title='ma')
