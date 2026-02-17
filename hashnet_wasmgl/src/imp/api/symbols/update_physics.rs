use crate::exports;
use crate::exports::GlobalState;

/// Triggers the physics update for all particles in the simulation for the current frame.
pub fn update_physics(gs: &mut GlobalState, dt: f32) {
    exports::update_physics(gs, dt);
}
