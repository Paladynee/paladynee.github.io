use core::arch::wasm32::f32_floor;
use core::arch::wasm32::f32_sqrt;
use core::arch::wasm32::f32x4_add;
use core::arch::wasm32::f32x4_extract_lane;
use core::arch::wasm32::f32x4_floor;
use core::arch::wasm32::f32x4_mul;
use core::arch::wasm32::f32x4_replace_lane;
use core::arch::wasm32::f32x4_splat;
use core::arch::wasm32::f32x4_sub;
use core::arch::wasm32::i32x4_shuffle;
use core::arch::wasm32::v128;
use core::f32;
use core::f32::consts::FRAC_PI_2 as HALF_PI;
use core::f32::consts::PI;
use core::f32::consts::TAU;
use core::f64;

const FRAC_1_TAU: f32 = (1.0f64 / f64::consts::TAU) as f32;

// Polynomial coefficients (minimax-optimized)
const C1: f32 = -0.166_666_67;
const C2: f32 =  0.008_333_331;
const C3: f32 = -0.000_198_409;
const C4: f32 =  0.000_002_752_6;

#[inline(always)]
pub fn sqrtf(x: f32) -> f32 {
    f32_sqrt(x)
}

#[inline(always)]
pub fn f32x4_from_array(values: [f32; 4]) -> v128 {
    let mut out = f32x4_splat(values[0]);
    out = f32x4_replace_lane::<1>(out, values[1]);
    out = f32x4_replace_lane::<2>(out, values[2]);
    out = f32x4_replace_lane::<3>(out, values[3]);
    out
}

#[inline(always)]
fn reduce_angle_scalar(x: f32) -> f32 {
    let k = f32_floor((x + PI) * FRAC_1_TAU);
    x - k * TAU
}

#[inline(always)]
pub fn sin_approx(x: f32) -> f32 {
    let r = reduce_angle_scalar(x);
    let u = r * r;
    let u2 = u * u;

    //  Estrin's: 3 dependent stages instead of 4
    //
    //  Stage 1 (parallel):  a = C1 + u*C2
    //                       b = C3 + u*C4
    //                       u2 = u*u        (free, overlaps with a,b)
    //  Stage 2:             q = a + u2*b
    //  Stage 3:             P = 1 + u*q
    //  Final:               result = r * P

    let a = C1 + u * C2;       // low pair
    let b = C3 + u * C4;       // high pair  (independent of a)
    let q = a + u2 * b;        // combine

    r * (1.0 + u * q)
}

#[inline(always)]
pub fn cos_approx(x: f32) -> f32 {
    sin_approx(x + HALF_PI)
}

#[inline(always)]
pub fn sin_cos_approx(x: f32) -> (f32, f32) {
    (sin_approx(x), cos_approx(x))
}

#[inline(always)]
fn reduce_angle4(x: v128) -> v128 {
    let k = f32x4_floor(f32x4_mul(
        f32x4_add(x, f32x4_splat(PI)),
        f32x4_splat(FRAC_1_TAU),
    ));
    f32x4_sub(x, f32x4_mul(k, f32x4_splat(TAU)))
}

#[inline(always)]
pub fn sin_approx4(x: v128) -> v128 {
    let r = reduce_angle4(x);
    let u = f32x4_mul(r, r);
    let u2 = f32x4_mul(u, u);

    // Estrin's method — same 3-stage dependency chain
    let a = f32x4_add(f32x4_splat(C1), f32x4_mul(u, f32x4_splat(C2)));
    let b = f32x4_add(f32x4_splat(C3), f32x4_mul(u, f32x4_splat(C4)));
    let q = f32x4_add(a, f32x4_mul(u2, b));

    let poly = f32x4_add(f32x4_splat(1.0), f32x4_mul(u, q));
    f32x4_mul(r, poly)
}

#[inline(always)]
pub fn cos_approx4(x: v128) -> v128 {
    sin_approx4(f32x4_add(x, f32x4_splat(HALF_PI)))
}

#[inline(always)]
pub fn sin_cos_approx4(x: v128) -> (v128, v128) {
    (sin_approx4(x), cos_approx4(x))
}

#[inline(always)]
pub fn horizontal_sum4(v: v128) -> f32 {
    let pair = f32x4_add(v, i32x4_shuffle::<2, 3, 0, 1>(v, v));
    let all = f32x4_add(pair, i32x4_shuffle::<1, 0, 3, 2>(pair, pair));
    f32x4_extract_lane::<0>(all)
}