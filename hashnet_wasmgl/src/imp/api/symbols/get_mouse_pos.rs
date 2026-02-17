use crate::exports::GlobalState;
use crate::exports::Vec2f;

/// Returns a pointer to the current mouse position stored in the global state.
pub fn get_mouse_pos(gs: &mut GlobalState) -> *const Vec2f {
    &gs.mouse_position
}
