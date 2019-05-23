//@version=3
study("MA Cross Time")

// === INPUT GENERAL ===
period = input(20, minval=1, title="MA Length")
smooth = input(200, minval=1, title="Cross Smooth")

// === CROSS CALC ===
ma = ema(close, period)
cross = crossunder(close, ma) or crossover(close, ma)
since_cross = barssince(cross)
smooth_cross = ema(since_cross, smooth)

// === PLOT ===
plot(since_cross, color=green, linewidth=2, title="Since Cross")
plot(smooth_cross, color=white, linewidth=2, title="Avg Time")
