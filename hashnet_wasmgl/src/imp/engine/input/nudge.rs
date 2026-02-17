use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;
use crate::exports::USE_MANUAL_SIMD;
use crate::exports::simd_math::*;
use core::arch::wasm32::f32x4_add;
use core::arch::wasm32::f32x4_mul;
use core::arch::wasm32::f32x4_splat;
use core::arch::wasm32::v128_load;
use core::arch::wasm32::v128_store;
use core::f32;

pub fn nudge(gs: &mut GlobalState) {
    if USE_MANUAL_SIMD { nudge_simd(gs) } else { nudge_scalar(gs) }
}

fn nudge_scalar(gs: &mut GlobalState) {
    let mut i = 0;
    while i < GAME_OBJECTS_AMT {
        unsafe {
            let angle = gs.rand_f32() * 2.0 * f32::consts::PI;
            let dist = 20.0;
            let (s, c) = sin_cos_approx(angle);
            *gs.game_objects.xs.get_unchecked_mut(i) += c * dist;
            *gs.game_objects.ys.get_unchecked_mut(i) += s * dist;
        }
        i += 1;
    }
}

fn nudge_simd(gs: &mut GlobalState) {
    let two_pi = 2.0 * f32::consts::PI;
    let dist = 20.0;
    let two_piv = f32x4_splat(two_pi);
    let distv = f32x4_splat(dist);
    let xs_ptr = gs.game_objects.xs.as_mut_ptr();
    let ys_ptr = gs.game_objects.ys.as_mut_ptr();

    let mut i = 0usize;
    while i + 4 <= GAME_OBJECTS_AMT {
        let uv = f32x4_from_array(gs.rand_f32x4());
        let angles = f32x4_mul(uv, two_piv);
        let (sinv, cosv) = sin_cos_approx4(angles);
        let dxv = f32x4_mul(cosv, distv);
        let dyv = f32x4_mul(sinv, distv);

        unsafe {
            let x = v128_load(xs_ptr.add(i) as *const _);
            let y = v128_load(ys_ptr.add(i) as *const _);
            v128_store(xs_ptr.add(i) as *mut _, f32x4_add(x, dxv));
            v128_store(ys_ptr.add(i) as *mut _, f32x4_add(y, dyv));
        }

        i += 4;
    }

    while i < GAME_OBJECTS_AMT {
        let angle = gs.rand_f32() * two_pi;
        let (s, c) = sin_cos_approx(angle);
        unsafe {
            *xs_ptr.add(i) += c * dist;
            *ys_ptr.add(i) += s * dist;
        }
        i += 1;
    }
}
