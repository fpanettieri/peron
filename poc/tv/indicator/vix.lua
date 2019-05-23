//@version=3
study("VIX", overlay=false)

// === INPUT GENERAL ===
vix_prd = input(20, minval=1)

// === VIX ===
vix_top = (high - lowest(close, vix_prd)) / (lowest(close, vix_prd)) * 100
vix_bot = (highest(close, vix_prd) - low) / (highest(close, vix_prd)) * 100

// === PLOT ===
plot(vix_top, color=#F1453D, linewidth=2, style=area, transp=30, title='Greed')
plot(vix_bot, color=#50AD55, linewidth=2, style=area, transp=30, title='Fear')
