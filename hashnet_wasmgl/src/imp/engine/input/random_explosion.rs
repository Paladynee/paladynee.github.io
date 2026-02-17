use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;
use crate::exports::USE_MANUAL_SIMD;
use crate::exports::simd_math::*;
use core::arch::wasm32::f32x4_mul;
use core::arch::wasm32::f32x4_splat;
use core::arch::wasm32::v128_store;
use core::f32;

pub fn random_explosion(gs: &mut GlobalState) {
    if USE_MANUAL_SIMD {
        random_explosion_simd(gs)
    } else {
        random_explosion_scalar(gs)
    }
}

fn random_explosion_scalar(gs: &mut GlobalState) {
    let mut i = 0;
    while i < GAME_OBJECTS_AMT {
        unsafe {
            let angle = gs.rand_f32() * 2.0 * f32::consts::PI;
            let (s, c) = sin_cos_approx(angle);
            *gs.game_objects.vxs.get_unchecked_mut(i) = c * 5000.0;
            *gs.game_objects.vys.get_unchecked_mut(i) = s * 5000.0;
        }
        i += 1;
    }
}

fn random_explosion_simd(gs: &mut GlobalState) {
    let two_pi = 2.0 * f32::consts::PI;
    let scale = 5000.0;
    let two_piv = f32x4_splat(two_pi);
    let scalev = f32x4_splat(scale);
    let vxs_ptr = gs.game_objects.vxs.as_mut_ptr();
    let vys_ptr = gs.game_objects.vys.as_mut_ptr();

    let mut i = 0usize;
    while i + 4 <= GAME_OBJECTS_AMT {
        let uv = f32x4_from_array(gs.rand_f32x4());
        let angles = f32x4_mul(uv, two_piv);
        let (sinv, cosv) = sin_cos_approx4(angles);
        let vxv = f32x4_mul(cosv, scalev);
        let vyv = f32x4_mul(sinv, scalev);

        unsafe {
            v128_store(vxs_ptr.add(i) as *mut _, vxv);
            v128_store(vys_ptr.add(i) as *mut _, vyv);
        }
        i += 4;
    }

    while i < GAME_OBJECTS_AMT {
        let angle = gs.rand_f32() * two_pi;
        let (s, c) = sin_cos_approx(angle);
        unsafe {
            *vxs_ptr.add(i) = c * scale;
            *vys_ptr.add(i) = s * scale;
        }
        i += 1;
    }
}
