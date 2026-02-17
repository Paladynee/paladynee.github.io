use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;
use crate::exports::USE_MANUAL_SIMD;
use core::arch::wasm32::f32x4_add;
use core::arch::wasm32::f32x4_splat;
use core::arch::wasm32::v128_load;
use core::arch::wasm32::v128_store;

pub fn vim_controls(gs: &mut GlobalState, dx: f32, dy: f32) {
    if USE_MANUAL_SIMD {
        vim_controls_simd(gs, dx, dy)
    } else {
        vim_controls_scalar(gs, dx, dy)
    }
}

fn vim_controls_scalar(gs: &mut GlobalState, dx: f32, dy: f32) {
    let mut i = 0;
    while i < GAME_OBJECTS_AMT {
        unsafe {
            *gs.game_objects.xs.get_unchecked_mut(i) += dx;
            *gs.game_objects.ys.get_unchecked_mut(i) += dy;
        }
        i += 1;
    }
}

fn vim_controls_simd(gs: &mut GlobalState, dx: f32, dy: f32) {
    let dxv = f32x4_splat(dx);
    let dyv = f32x4_splat(dy);
    let xs_ptr = gs.game_objects.xs.as_mut_ptr();
    let ys_ptr = gs.game_objects.ys.as_mut_ptr();

    let mut i = 0usize;
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
