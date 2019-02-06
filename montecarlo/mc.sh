#!/bin/bash
rm -f /tmp/out.jpg && node mc.js | gnuplot -p -e 'set terminal jpeg; plot "/dev/stdin"' >> /tmp/out.jpg && open /tmp/out.jpg
