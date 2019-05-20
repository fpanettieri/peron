//@version=3
study(shorttitle="BB NTZ", title="Bollinger Bands [No Trade Zone]", overlay=true)

length = input(20, minval=1)
src = input(close, title="Source")
bb_mul = input(2.0, minval=0.001, maxval=50)
ntz_mul = input(0.7, minval=0.001, maxval=50)

basis = sma(src, length)
bb_dev = bb_mul * stdev(src, length)
nt_dev = ntz_mul * stdev(src, length)

upper = basis + bb_dev
lower = basis - bb_dev

ntz_up = basis + nt_dev
ntz_low = basis - nt_dev

// Render indicator
plot(basis, color=red)

p1 = plot(upper, color=blue)
p2 = plot(lower, color=blue)
fill(p1, p2)

ntp1 = plot(ntz_up, color=gray)
ntp2 = plot(ntz_low, color=gray)
fill(ntp1, ntp2, color=gray)
