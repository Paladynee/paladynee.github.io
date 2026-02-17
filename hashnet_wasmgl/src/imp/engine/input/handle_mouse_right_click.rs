use core::arch::wasm32::f32_sqrt;
use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;

pub fn handle_mouse_right_click(gs: &mut GlobalState) {
    let mpx = gs.mouse_position.x;
    let mpy = gs.mouse_position.y;
    let mut i = 0;
    while i < GAME_OBJECTS_AMT {
        unsafe {
            let px = *gs.game_objects.xs.get_unchecked(i);
            let py = *gs.game_objects.ys.get_unchecked(i);
            let dx = mpx - px;
            let dy = mpy - py;
            let dist = f32_sqrt(dx * dx + dy * dy);

            let mut dnx = dx;
            let mut dny = dy;
            if dist > 1e-6 {
                dnx /= dist;
                dny /= dist;
            }

            let power = 5.0 * dist;
            *gs.game_objects.vxs.get_unchecked_mut(i) = dnx * power;
            *gs.game_objects.vys.get_unchecked_mut(i) = dny * power;
        }
        i += 1;
    }
}
