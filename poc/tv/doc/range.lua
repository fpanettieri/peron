//@version=3

strategy("How To Set Backtest Range", shorttitle = " ", overlay=true, max_bars_back=200)

// Revision:        1
// Author:          @allanster

// === INPUT SMA ===
fastMA    = input(defval = 14, type = integer, title = "FastMA", minval = 1, step = 1)
slowMA    = input(defval = 28, type = integer, title = "SlowMA", minval = 1, step = 1)

// === INPUT BACKTEST RANGE ===
FromMonth = input(defval = 9, title = "From Month", minval = 1, maxval = 12)
FromDay   = input(defval = 1, title = "From Day", minval = 1, maxval = 31)
FromYear  = input(defval = 2018, title = "From Year", minval = 2017)
ToMonth   = input(defval = 1, title = "To Month", minval = 1, maxval = 12)
ToDay     = input(defval = 1, title = "To Day", minval = 1, maxval = 31)
ToYear    = input(defval = 9999, title = "To Year", minval = 2017)

// === FUNCTION EXAMPLE ===
start     = timestamp(FromYear, FromMonth, FromDay, 00, 00)  // backtest start window
finish    = timestamp(ToYear, ToMonth, ToDay, 23, 59)        // backtest finish window
window()  => time >= start and time <= finish ? true : false // create function "within window of time"

// === SERIES SETUP ===
buy  = crossover(sma(close, fastMA), sma(close, slowMA))     // buy when fastMA crosses over slowMA
sell = crossunder(sma(close, fastMA), sma(close, slowMA))    // sell when fastMA crosses under slowMA

// === EXECUTION ===
strategy.entry("L", strategy.long, when = window() and buy)  // buy long when "within window of time" AND crossover
strategy.close("L", when = window() and sell)                // sell long when "within window of time" AND crossunder

plot(sma(close, fastMA), title = 'FastMA', color = yellow, linewidth = 2, style = line)  // plot FastMA
plot(sma(close, slowMA), title = 'SlowMA', color = aqua, linewidth = 2, style = line)    // plot SlowMA
