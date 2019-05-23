//@version=3
study("Min/Max", overlay=true)

// === INPUT GENERAL ===
period = input(20, minval=1)

// === MIN / MAX ===
min = lowest(close, period)
max = highest(close, period)

// === PLOT ===
plot(min, color=#50AD55, transp=30)
plot(max, color=#F1453D, transp=30)
fill(min, max)
