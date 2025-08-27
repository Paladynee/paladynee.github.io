const { performance } = require("perf_hooks");

// Define the functions

function isOutsideBoundsComparison(vec, tl, br) {
  return vec[0] < tl[0] || vec[0] > br[0] || vec[1] < tl[1] || vec[1] > br[1];
}

function isOutsideBoundsBitwise(vec, tl, br) {
  return (
    ((vec[0] - tl[0]) |
      (br[0] - vec[0]) |
      (vec[1] - tl[1]) |
      (br[1] - vec[1])) >>
      31 !==
    0
  );
}

// Generate random vectors and constants

function xorshift32(seed = 123456789) {
  let x = seed;
  return function () {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return (x >>> 0) / 0xffffffff; // Normalize to [0, 1]
  };
}

let numTests = 1_000_000;

const random = xorshift32(Math.random() * 0xffffffff);
const vectors = Array.from({ length: numTests }, () => [
  random() * 20000 - 10000,
  random() * 20000 - 10000,
]);

console.log(vectors);

const tl = [0, 0];
const br = [1366, 768];

// Benchmark the comparison version

const startComparison = performance.now();
for (let i = 0; i < numTests; i++) {
  isOutsideBoundsComparison(vectors[i], tl, br);
}
const endComparison = performance.now();
const comparisonTime = endComparison - startComparison;

// Benchmark the bitwise version

const startBitwise = performance.now();
for (let i = 0; i < numTests; i++) {
  isOutsideBoundsBitwise(vectors[i], tl, br);
}
const endBitwise = performance.now();
const bitwiseTime = endBitwise - startBitwise;

console.log(`Comparison version took ${comparisonTime} milliseconds.`);
console.log(`Bitwise version took ${bitwiseTime} milliseconds.`);
