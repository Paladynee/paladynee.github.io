use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;
use crate::exports::USE_MANUAL_SIMD;
use core::arch::wasm32::f32x4_splat;
use core::arch::wasm32::v128_store;

pub fn stop(gs: &mut GlobalState) {
    if USE_MANUAL_SIMD { stop_simd(gs) } else { stop_scalar(gs) }
}

fn stop_scalar(gs: &mut GlobalState) {
    let mut i = 0;
    while i < GAME_OBJECTS_AMT {
        unsafe {
            *gs.game_objects.vxs.get_unchecked_mut(i) = 0.0;
            *gs.game_objects.vys.get_unchecked_mut(i) = 0.0;
            *gs.game_objects.axs.get_unchecked_mut(i) = 0.0;
            *gs.game_objects.ays.get_unchecked_mut(i) = 0.0;
        }
        i += 1;
    }
}

fn stop_simd(gs: &mut GlobalState) {
    let zero = f32x4_splat(0.0);
    let vxs_ptr = gs.game_objects.vxs.as_mut_ptr();
    let vys_ptr = gs.game_objects.vys.as_mut_ptr();
    let axs_ptr = gs.game_objects.axs.as_mut_ptr();
    let ays_ptr = gs.game_objects.ays.as_mut_ptr();

    let mut i = 0usize;
    while i + 4 <= GAME_OBJECTS_AMT {
        unsafe {
            v128_store(vxs_ptr.add(i) as *mut _, zero);
            v128_store(vys_ptr.add(i) as *mut _, zero);
            v128_store(axs_ptr.add(i) as *mut _, zero);
            v128_store(ays_ptr.add(i) as *mut _, zero);
        }
        i += 4;
    }

    while i < GAME_OBJECTS_AMT {
        unsafe {
            *vxs_ptr.add(i) = 0.0;
            *vys_ptr.add(i) = 0.0;
            *axs_ptr.add(i) = 0.0;
            *ays_ptr.add(i) = 0.0;
        }
        i += 1;
    }
}
