use crate::exports::GlobalState;

/// Returns a pointer to the color pointer set: [r, g, b].
pub fn get_color_pointers(gs: &mut GlobalState) -> *const [*mut u8; 3] {
    &gs.color_pointers
}
