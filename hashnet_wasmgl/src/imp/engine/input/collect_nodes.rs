use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;
use crate::exports::USE_MANUAL_SIMD;
use core::arch::wasm32::f32x4_splat;
use core::arch::wasm32::v128_store;

pub fn collect_nodes(gs: &mut GlobalState) {
    if USE_MANUAL_SIMD {
        collect_nodes_simd(gs)
    } else {
        collect_nodes_scalar(gs)
    }
}

fn collect_nodes_scalar(gs: &mut GlobalState) {
    let mpx = gs.mouse_position.x;
    let mpy = gs.mouse_position.y;
    let mut i = 0;
    while i < GAME_OBJECTS_AMT {
        unsafe {
            *gs.game_objects.xs.get_unchecked_mut(i) = mpx;
            *gs.game_objects.ys.get_unchecked_mut(i) = mpy;
        }
        i += 1;
    }
}

fn collect_nodes_simd(gs: &mut GlobalState) {
    let mpxv = f32x4_splat(gs.mouse_position.x);
    let mpyv = f32x4_splat(gs.mouse_position.y);
    let xs_ptr = gs.game_objects.xs.as_mut_ptr();
    let ys_ptr = gs.game_objects.ys.as_mut_ptr();

    let mut i = 0usize;
    while i + 4 <= GAME_OBJECTS_AMT {
        unsafe {
            v128_store(xs_ptr.add(i) as *mut _, mpxv);
            v128_store(ys_ptr.add(i) as *mut _, mpyv);
        }
        i += 4;
    }

    let mpx = gs.mouse_position.x;
    let mpy = gs.mouse_position.y;
    while i < GAME_OBJECTS_AMT {
        unsafe {
            *xs_ptr.add(i) = mpx;
            *ys_ptr.add(i) = mpy;
        }
        i += 1;
    }
}
