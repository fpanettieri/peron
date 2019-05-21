//@version=3

study("VIX", overlay=false)

// === INPUT GENERAL ===
vix_prd = input(20, minval=1)
ma_prd = input(100, minval=1)

// === VIX ===
vix_top = (high - lowest(close, vix_prd)) / (lowest(close, vix_prd)) * 100
vix_bot = (highest(close, vix_prd) - low) / (highest(close, vix_prd)) * 100

// === MA ===
ma_top = sma(vix_top, 100)
ma_top = sma(src, 100)

// === PLOT ===
plot(vix_top, color=white)
plot(vix_bot, color=red)
plot(ma_top, color=blue)
plot(ma_bot, color=green)
