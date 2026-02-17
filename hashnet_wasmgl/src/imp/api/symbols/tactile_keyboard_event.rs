use crate::exports::GlobalState;
use crate::exports::handle_tactile_input;

/// Processes a tactile input event in the engine.
pub fn tactile_keyboard_event(gs: &mut GlobalState, code: u32) {
    handle_tactile_input(gs, code as u8);
}
