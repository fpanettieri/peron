//@version=3
study(shorttitle="BB", title="Bollinger Bands", overlay=true)
src = close
short_length = 20
long_length = 200
mult = 2

short_basis = sma(src, short_length)
long_basis = sma(src, long_length)

short_dev = mult * stdev(src, short_length)
long_dev = mult * stdev(src, long_length)

short_upper = short_basis + short_dev
short_lower = short_basis - short_dev

long_upper = long_basis + long_dev
long_lower = long_basis - long_dev

plot(short_basis, color=red)
plot(long_basis, color=red)

// p1 = plot(upper, color=blue)
// p2 = plot(lower, color=blue)
// fill(p1, p2)
