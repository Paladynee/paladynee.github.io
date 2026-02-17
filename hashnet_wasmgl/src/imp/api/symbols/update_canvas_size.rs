use crate::exports::GlobalState;
use crate::exports::Hf;
use crate::exports::Vec2f;

/// Updates the simulation's recorded canvas dimensions and adjusts normalization factors.
pub fn update_canvas_size(gs: &mut GlobalState, width: f32, height: f32) {
    gs.screen_size = [width as _, height as _];
    gs.unit_size = Vec2f {
        x: 1.0 / width,
        y: 1.0 / width,
    };
    gs.collect_entropy(Hf(width));
    gs.collect_entropy(Hf(height));
}
