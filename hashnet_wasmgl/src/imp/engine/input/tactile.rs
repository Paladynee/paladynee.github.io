use super::handle_mouse_left_click::handle_mouse_left_click;
use super::handle_mouse_right_click::handle_mouse_right_click;
use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;

const TACTILE_MOUSE_LEFT_DOWN: u8 = 250;
const TACTILE_MOUSE_RIGHT_DOWN: u8 = 251;

/// Handles a single "tactile" key press event.
pub fn handle_tactile_input(gs: &mut GlobalState, code: u8) {
    match code {
        TACTILE_MOUSE_LEFT_DOWN => handle_mouse_left_click(gs),
        TACTILE_MOUSE_RIGHT_DOWN => handle_mouse_right_click(gs),
        b'r' => gs.reset_palette(),
        27 => gs.obliterated = !gs.obliterated,
        b'+' => {
            gs.hashnet_depth = gs.hashnet_depth.saturating_add(3).min(GAME_OBJECTS_AMT as u32);
        }
        b'-' => {
            gs.hashnet_depth = gs.hashnet_depth.saturating_sub(3);
        }
        b'x' => {
            let remainder = 1.0 - gs.friction;
            gs.friction += remainder / 2.0;
            if gs.friction >= 1.0 {
                gs.friction = 0.5;
            }
        }
        b'z' => {
            let remainder = 1.0 - gs.friction;
            if gs.friction <= 0.75 {
                gs.friction /= 2.0;
            } else {
                gs.friction -= remainder * 2.0;
            }
            if gs.friction <= 0.0 || gs.friction >= 1.0 {
                gs.friction = 0.5;
            }
        }
        b'q' => gs.friction = 0.5,
        b'0' => gs.clamping_behavior = !gs.clamping_behavior,
        b'5' => gs.mouse_prevent = !gs.mouse_prevent,
        _ => {}
    }
}
