use crate::exports::GlobalState;

/// Returns a pointer to the draw pointer set: [x, y, vx, vy].
pub fn get_draw_pointers(gs: &mut GlobalState) -> *const [*mut f32; 4] {
    &gs.soa_pointers
}
