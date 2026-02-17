use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;
use crate::exports::USE_MANUAL_SIMD;
use crate::exports::simd_math::*;
use core::arch::wasm32::f32x4_add;
use core::arch::wasm32::f32x4_div;
use core::arch::wasm32::f32x4_mul;
use core::arch::wasm32::f32x4_splat;
use core::arch::wasm32::f32x4_sqrt;
use core::arch::wasm32::f32x4_sub;
use core::arch::wasm32::v128_load;
use core::arch::wasm32::v128_store;

pub fn handle_orbit(gs: &mut GlobalState, rotation: f32) {
    if USE_MANUAL_SIMD {
        handle_orbit_simd(gs, rotation)
    } else {
        handle_orbit_scalar(gs, rotation)
    }
}

fn handle_orbit_scalar(gs: &mut GlobalState, rotation: f32) {
    let mpx = gs.mouse_position.x;
    let mpy = gs.mouse_position.y;
    let mut i = 0;
    let (sin_r, cos_r) = sin_cos_approx(rotation);

    while i < GAME_OBJECTS_AMT {
        unsafe {
            let px = *gs.game_objects.xs.get_unchecked(i);
            let py = *gs.game_objects.ys.get_unchecked(i);
            let vx = *gs.game_objects.vxs.get_unchecked(i);
            let vy = *gs.game_objects.vys.get_unchecked(i);

            let dx = mpx - px;
            let dy = mpy - py;

            let rx = dx * cos_r - dy * sin_r;
            let ry = dx * sin_r + dy * cos_r;

            let len = sqrtf(rx * rx + ry * ry) + 1e-6;
            let v_mag = sqrtf(vx * vx + vy * vy);

            *gs.game_objects.vxs.get_unchecked_mut(i) = (rx / len) * v_mag;
            *gs.game_objects.vys.get_unchecked_mut(i) = (ry / len) * v_mag;
        }
        i += 1;
    }
}

fn handle_orbit_simd(gs: &mut GlobalState, rotation: f32) {
    let mpxv = f32x4_splat(gs.mouse_position.x);
    let mpyv = f32x4_splat(gs.mouse_position.y);
    let (sin_r, cos_r) = sin_cos_approx(rotation);
    let sin_rv = f32x4_splat(sin_r);
    let cos_rv = f32x4_splat(cos_r);
    let epsv = f32x4_splat(1e-6);

    let xs_ptr = gs.game_objects.xs.as_mut_ptr();
    let ys_ptr = gs.game_objects.ys.as_mut_ptr();
    let vxs_ptr = gs.game_objects.vxs.as_mut_ptr();
    let vys_ptr = gs.game_objects.vys.as_mut_ptr();

    let mut i = 0usize;
    while i + 4 <= GAME_OBJECTS_AMT {
        unsafe {
            let pxv = v128_load(xs_ptr.add(i) as *const _);
            let pyv = v128_load(ys_ptr.add(i) as *const _);
            let vxv = v128_load(vxs_ptr.add(i) as *const _);
            let vyv = v128_load(vys_ptr.add(i) as *const _);

            let dxv = f32x4_sub(mpxv, pxv);
            let dyv = f32x4_sub(mpyv, pyv);

            let rxv = f32x4_sub(f32x4_mul(dxv, cos_rv), f32x4_mul(dyv, sin_rv));
            let ryv = f32x4_add(f32x4_mul(dxv, sin_rv), f32x4_mul(dyv, cos_rv));

            let lenv = f32x4_add(f32x4_sqrt(f32x4_add(f32x4_mul(rxv, rxv), f32x4_mul(ryv, ryv))), epsv);
            let vmagv = f32x4_sqrt(f32x4_add(f32x4_mul(vxv, vxv), f32x4_mul(vyv, vyv)));

            let new_vx = f32x4_mul(f32x4_div(rxv, lenv), vmagv);
            let new_vy = f32x4_mul(f32x4_div(ryv, lenv), vmagv);

            v128_store(vxs_ptr.add(i) as *mut _, new_vx);
            v128_store(vys_ptr.add(i) as *mut _, new_vy);
        }
        i += 4;
    }

    let mpx = gs.mouse_position.x;
    let mpy = gs.mouse_position.y;
    let (sin_r, cos_r) = sin_cos_approx(rotation);
    while i < GAME_OBJECTS_AMT {
        unsafe {
            let px = *xs_ptr.add(i);
            let py = *ys_ptr.add(i);
            let vx = *vxs_ptr.add(i);
            let vy = *vys_ptr.add(i);

            let dx = mpx - px;
            let dy = mpy - py;
            let rx = dx * cos_r - dy * sin_r;
            let ry = dx * sin_r + dy * cos_r;

            let len = sqrtf(rx * rx + ry * ry) + 1e-6;
            let v_mag = sqrtf(vx * vx + vy * vy);

            *vxs_ptr.add(i) = (rx / len) * v_mag;
            *vys_ptr.add(i) = (ry / len) * v_mag;
        }
        i += 1;
    }
}
