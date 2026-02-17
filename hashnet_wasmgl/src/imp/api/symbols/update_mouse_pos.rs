use crate::exports::GlobalState;
use crate::exports::Hf;

/// Updates the recorded mouse cursor position and contributes to entropy collection.
pub fn update_mouse_pos(gs: &mut GlobalState, x: f32, y: f32) {
    if gs.mouse_prevent {
        return;
    }
    gs.mouse_position.x = x;
    gs.mouse_position.y = y;
    gs.collect_entropy(Hf(x));
    gs.collect_entropy(Hf(y));
}
