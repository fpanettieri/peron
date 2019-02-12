let iterations = 1000;
let samples = [];

let size = 1000000;
let arr = [];
let op = 0;

let t_of = [0, 0];
let t_for = [0, 0];

for (let i = 0; i < iterations; i++) {

  // reset
  op = 0;
  t_of = [0, 0];
  t_for = [0, 0];

  // populate array
  arr = [];
  for (let j = 0; j < size; j++) {
    arr.push(j);
  }

  // of iteration
  t_of[0] = Date.now()
  for (let v of arr) {
    op += v;
  }
  t_of[1] = Date.now();

  // for iteration
  t_for[0] = Date.now()
  for (let j = 0; j < arr.length; j++) {
    op += j;
  }
  t_for[1] = Date.now();

  samples.push({of: t_of, for: t_for});
}

// total time
acc = {of: 0, for: 0};
for (let i = 0; i < samples.length; i++) {
  let sample = samples[i];
  acc.of += sample.of[1] - sample.of[0];
  acc.for += sample.for[1] - sample.for[0];
}

// report
console.log(`results:\niterations: ${iterations}\nof: ${acc.of}ms\nfor: ${acc.for}ms`);
