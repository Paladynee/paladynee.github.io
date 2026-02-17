use crate::exports::GlobalState;

/// Triggers a re-randomization of the particle color palette.
pub fn reset_palette(gs: &mut GlobalState) {
    gs.reset_palette();
}
