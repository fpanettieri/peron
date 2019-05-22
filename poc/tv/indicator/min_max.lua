//@version=3

study("Min/Max", overlay=true)

// === INPUT GENERAL ===
period = input(20, minval=1)

// === PLOT ===
plot(highest(close, period), color=#F1453D, transp=30)
plot(lowest(close, period), color=#50AD55, transp=30)
