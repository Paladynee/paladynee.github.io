use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;
use crate::exports::USE_MANUAL_SIMD;
use crate::exports::simd_math::*;
use core::arch::wasm32::f32x4_add;
use core::arch::wasm32::f32x4_mul;
use core::arch::wasm32::f32x4_splat;
use core::arch::wasm32::f32x4_sqrt;
use core::arch::wasm32::f32x4_sub;
use core::arch::wasm32::v128_load;
use core::arch::wasm32::v128_store;
use core::f32::consts::PI;

pub fn converge(gs: &mut GlobalState) {
    if USE_MANUAL_SIMD { converge_simd(gs) } else { converge_scalar(gs) }
}

fn converge_scalar(gs: &mut GlobalState) {
    let mpx = gs.mouse_position.x;
    let mpy = gs.mouse_position.y;
    let mut i = 0;
    while i < GAME_OBJECTS_AMT {
        unsafe {
            let px = *gs.game_objects.xs.get_unchecked(i);
            let py = *gs.game_objects.ys.get_unchecked(i);
            let dx = mpx - px;
            let dy = mpy - py;
            let dist = sqrtf(dx * dx + dy * dy);

            let angle = gs.rand_f32() * 2.0 * PI;
            let (s, c) = sin_cos_approx(angle);
            let target_x = mpx + c * dist * 4.0;
            let target_y = mpy + s * dist * 4.0;

            *gs.game_objects.vxs.get_unchecked_mut(i) = (target_x - px) * 3.0;
            *gs.game_objects.vys.get_unchecked_mut(i) = (target_y - py) * 3.0;
        }
        i += 1;
    }
}

fn converge_simd(gs: &mut GlobalState) {
    let mpx = gs.mouse_position.x;
    let mpy = gs.mouse_position.y;
    let mpxv = f32x4_splat(mpx);
    let mpyv = f32x4_splat(mpy);
    let scale4 = f32x4_splat(4.0);
    let scale3 = f32x4_splat(3.0);
    let two_pi = 2.0 * PI;
    let two_piv = f32x4_splat(two_pi);

    let xs_ptr = gs.game_objects.xs.as_mut_ptr();
    let ys_ptr = gs.game_objects.ys.as_mut_ptr();
    let vxs_ptr = gs.game_objects.vxs.as_mut_ptr();
    let vys_ptr = gs.game_objects.vys.as_mut_ptr();

    let mut i = 0usize;
    while i + 4 <= GAME_OBJECTS_AMT {
        unsafe {
            let pxv = v128_load(xs_ptr.add(i) as *const _);
            let pyv = v128_load(ys_ptr.add(i) as *const _);
            let dxv = f32x4_sub(mpxv, pxv);
            let dyv = f32x4_sub(mpyv, pyv);
            let distv = f32x4_sqrt(f32x4_add(f32x4_mul(dxv, dxv), f32x4_mul(dyv, dyv)));

            let uv = f32x4_from_array(gs.rand_f32x4());
            let angles = f32x4_mul(uv, two_piv);
            let (sinv, cosv) = sin_cos_approx4(angles);

            let target_x = f32x4_add(mpxv, f32x4_mul(cosv, f32x4_mul(distv, scale4)));
            let target_y = f32x4_add(mpyv, f32x4_mul(sinv, f32x4_mul(distv, scale4)));

            let new_vx = f32x4_mul(f32x4_sub(target_x, pxv), scale3);
            let new_vy = f32x4_mul(f32x4_sub(target_y, pyv), scale3);

            v128_store(vxs_ptr.add(i) as *mut _, new_vx);
            v128_store(vys_ptr.add(i) as *mut _, new_vy);
        }

        i += 4;
    }

    while i < GAME_OBJECTS_AMT {
        unsafe {
            let px = *xs_ptr.add(i);
            let py = *ys_ptr.add(i);
            let dx = mpx - px;
            let dy = mpy - py;
            let dist = sqrtf(dx * dx + dy * dy);

            let angle = gs.rand_f32() * two_pi;
            let (s, c) = sin_cos_approx(angle);
            let target_x = mpx + c * dist * 4.0;
            let target_y = mpy + s * dist * 4.0;

            *vxs_ptr.add(i) = (target_x - px) * 3.0;
            *vys_ptr.add(i) = (target_y - py) * 3.0;
        }
        i += 1;
    }
}
