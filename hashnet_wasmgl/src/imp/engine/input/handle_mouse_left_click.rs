use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;
use core::arch::wasm32::f32_sqrt;
use core::f32;
use core::intrinsics::cosf32;
use core::intrinsics::sinf32;

pub fn handle_mouse_left_click(gs: &mut GlobalState) {
    let mpx = gs.mouse_position.x;
    let mpy = gs.mouse_position.y;
    let mut i = 0;
    while i < GAME_OBJECTS_AMT {
        unsafe {
            let px = *gs.game_objects.xs.get_unchecked(i);
            let py = *gs.game_objects.ys.get_unchecked(i);
            let mut dx = px - mpx;
            let mut dy = py - mpy;
            let dist_sq = dx * dx + dy * dy;
            let dist = f32_sqrt(dist_sq);

            if dist < 1e-6 {
                let angle = gs.rand_f32() * 2.0 * f32::consts::PI;
                dx = cosf32(angle);
                dy = sinf32(angle);
            } else {
                dx /= dist;
                dy /= dist;
            }

            let power = 1000000.0 / (dist + 100.0) / 2.0;
            *gs.game_objects.vxs.get_unchecked_mut(i) += dx * power;
            *gs.game_objects.vys.get_unchecked_mut(i) += dy * power;
        }
        i += 1;
    }
}
