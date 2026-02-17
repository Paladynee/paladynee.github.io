use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;
use crate::exports::USE_MANUAL_SIMD;
use crate::exports::simd_math::*;
use core::arch::wasm32::f32x4_add;
use core::arch::wasm32::f32x4_mul;
use core::arch::wasm32::f32x4_splat;
use core::arch::wasm32::v128_store;
use core::f32;

pub fn circle_around_mouse(gs: &mut GlobalState) {
    if USE_MANUAL_SIMD {
        circle_around_mouse_simd(gs)
    } else {
        circle_around_mouse_scalar(gs)
    }
}

fn circle_around_mouse_scalar(gs: &mut GlobalState) {
    let mpx = gs.mouse_position.x;
    let mpy = gs.mouse_position.y;
    let radius = 200.0;
    let angle_step = (2.0 * f32::consts::PI) / GAME_OBJECTS_AMT as f32;

    let mut i = 0;
    while i < GAME_OBJECTS_AMT {
        let angle = i as f32 * angle_step;
        let (s, c) = sin_cos_approx(angle);
        let ox = c * radius;
        let oy = s * radius;

        unsafe {
            *gs.game_objects.xs.get_unchecked_mut(i) = mpx + ox;
            *gs.game_objects.ys.get_unchecked_mut(i) = mpy + oy;

            *gs.game_objects.vxs.get_unchecked_mut(i) = -oy * 15.0;
            *gs.game_objects.vys.get_unchecked_mut(i) = ox * 15.0;
        }
        i += 1;
    }
}

fn circle_around_mouse_simd(gs: &mut GlobalState) {
    let mpx = gs.mouse_position.x;
    let mpy = gs.mouse_position.y;
    let radius = 200.0;
    let radiusv = f32x4_splat(radius);
    let vel_scalev = f32x4_splat(15.0);
    let angle_step = (2.0 * f32::consts::PI) / GAME_OBJECTS_AMT as f32;
    let step4 = 4.0 * angle_step;

    let xs_ptr = gs.game_objects.xs.as_mut_ptr();
    let ys_ptr = gs.game_objects.ys.as_mut_ptr();
    let vxs_ptr = gs.game_objects.vxs.as_mut_ptr();
    let vys_ptr = gs.game_objects.vys.as_mut_ptr();

    let base_lanes = [0.0, angle_step, 2.0 * angle_step, 3.0 * angle_step];
    let base_offsets = f32x4_from_array(base_lanes);

    let mut i = 0usize;
    let mut base_angle = 0.0f32;
    while i + 4 <= GAME_OBJECTS_AMT {
        let anglev = f32x4_add(f32x4_splat(base_angle), base_offsets);
        let (sinv, cosv) = sin_cos_approx4(anglev);
        let oxv = f32x4_mul(cosv, radiusv);
        let oyv = f32x4_mul(sinv, radiusv);

        let xv = f32x4_add(f32x4_splat(mpx), oxv);
        let yv = f32x4_add(f32x4_splat(mpy), oyv);
        let vxv = f32x4_mul(oyv, f32x4_splat(-15.0));
        let vyv = f32x4_mul(oxv, vel_scalev);

        unsafe {
            v128_store(xs_ptr.add(i) as *mut _, xv);
            v128_store(ys_ptr.add(i) as *mut _, yv);
            v128_store(vxs_ptr.add(i) as *mut _, vxv);
            v128_store(vys_ptr.add(i) as *mut _, vyv);
        }

        i += 4;
        base_angle += step4;
    }

    while i < GAME_OBJECTS_AMT {
        let angle = i as f32 * angle_step;
        let (s, c) = sin_cos_approx(angle);
        let ox = c * radius;
        let oy = s * radius;

        unsafe {
            *xs_ptr.add(i) = mpx + ox;
            *ys_ptr.add(i) = mpy + oy;
            *vxs_ptr.add(i) = -oy * 15.0;
            *vys_ptr.add(i) = ox * 15.0;
        }
        i += 1;
    }
}
