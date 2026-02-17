use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;
use crate::exports::USE_MANUAL_SIMD;
use crate::exports::simd_math::*;
use core::arch::wasm32::f32x4_add;
use core::arch::wasm32::f32x4_splat;
use core::arch::wasm32::v128_load;
use core::arch::wasm32::v128_store;

pub fn mouse_in_center(gs: &mut GlobalState) {
    if USE_MANUAL_SIMD {
        mouse_in_center_simd(gs)
    } else {
        mouse_in_center_scalar(gs)
    }
}

fn mouse_in_center_scalar(gs: &mut GlobalState) {
    let mut avg_x = 0.0;
    let mut avg_y = 0.0;
    let mut i = 0;
    while i < GAME_OBJECTS_AMT {
        unsafe {
            avg_x += *gs.game_objects.xs.get_unchecked(i);
            avg_y += *gs.game_objects.ys.get_unchecked(i);
        }
        i += 1;
    }
    avg_x /= GAME_OBJECTS_AMT as f32;
    avg_y /= GAME_OBJECTS_AMT as f32;

    let dx = gs.mouse_position.x - avg_x;
    let dy = gs.mouse_position.y - avg_y;

    i = 0;
    while i < GAME_OBJECTS_AMT {
        unsafe {
            *gs.game_objects.xs.get_unchecked_mut(i) += dx;
            *gs.game_objects.ys.get_unchecked_mut(i) += dy;
        }
        i += 1;
    }
}

fn mouse_in_center_simd(gs: &mut GlobalState) {
    let xs_ptr = gs.game_objects.xs.as_mut_ptr();
    let ys_ptr = gs.game_objects.ys.as_mut_ptr();

    let mut sum_x = f32x4_splat(0.0);
    let mut sum_y = f32x4_splat(0.0);
    let mut i = 0usize;

    while i + 4 <= GAME_OBJECTS_AMT {
        unsafe {
            sum_x = f32x4_add(sum_x, v128_load(xs_ptr.add(i) as *const _));
            sum_y = f32x4_add(sum_y, v128_load(ys_ptr.add(i) as *const _));
        }
        i += 4;
    }

    let mut avg_x = horizontal_sum4(sum_x);
    let mut avg_y = horizontal_sum4(sum_y);

    while i < GAME_OBJECTS_AMT {
        unsafe {
            avg_x += *xs_ptr.add(i);
            avg_y += *ys_ptr.add(i);
        }
        i += 1;
    }

    avg_x /= GAME_OBJECTS_AMT as f32;
    avg_y /= GAME_OBJECTS_AMT as f32;

    let dx = gs.mouse_position.x - avg_x;
    let dy = gs.mouse_position.y - avg_y;
    let dxv = f32x4_splat(dx);
    let dyv = f32x4_splat(dy);

    i = 0;
    while i + 4 <= GAME_OBJECTS_AMT {
        unsafe {
            let x = v128_load(xs_ptr.add(i) as *const _);
            let y = v128_load(ys_ptr.add(i) as *const _);
            v128_store(xs_ptr.add(i) as *mut _, f32x4_add(x, dxv));
            v128_store(ys_ptr.add(i) as *mut _, f32x4_add(y, dyv));
        }
        i += 4;
    }

    while i < GAME_OBJECTS_AMT {
        unsafe {
            *xs_ptr.add(i) += dx;
            *ys_ptr.add(i) += dy;
        }
        i += 1;
    }
}
