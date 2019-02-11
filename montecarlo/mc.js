'use strict';

const BTS = 0.00000001;
const MPY = 60 * 24 * 365;
// const balance = 105528012;
const funds = 1000000;

const position_size = 0.001;
const stop_loss = -0.02;
const target = 0.01;
const maker_fee = -0.025;
const taker_fee = 0.0750;
const leverage = 10;
const entry_success = 0.7;
const min_hold_time = 5;
const max_hold_time = 60;
const min_interval = 5;
const max_interval = 60;
const success_ratio = 0.1;
const liquidation_ratio = 1 / 15;

const iterations = 1;

for (let iteration = 0; iteration < iterations; iteration++) {
  let balance = funds;

  let time = 0;
  do {
    if (balance <= 0) { break; }

    time += Math.round(Math.random() * (max_interval - min_interval)) + min_interval;
    if (Math.random() > entry_success) {
      continue;
    }

    let position = balance * position_size;
    // console.log(`position ${position}`);

    if (Math.random() < success_ratio) {
      let delta = position * target * leverage;
      let fee = position * maker_fee * leverage;
      let gain = delta - fee;
      balance += gain;

    } else if (Math.random() < liquidation_ratio) {
      balance -= position;

    } else {
      let delta = position * stop_loss * leverage;
      let fee = position * maker_fee * leverage;
      let gain = delta - fee;
      balance += gain;
    }

    console.log(`${balance}`);

    time += Math.round(Math.random() * (max_hold_time - min_hold_time)) + min_hold_time;
  } while (time < MPY);
}
