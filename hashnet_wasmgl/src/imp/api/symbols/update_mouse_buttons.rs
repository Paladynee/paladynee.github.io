use crate::exports::GlobalState;

/// Updates the internal mouse button state bitmask.
pub fn update_mouse_buttons(gs: &mut GlobalState, mask: u32) {
    gs.mouse_buttons = mask;
}
