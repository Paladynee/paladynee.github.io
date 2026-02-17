use crate::exports::GlobalState;

/// Updates the internal keyboard state bitmask from the provided values.
pub fn update_keys(
    gs: &mut GlobalState,
    k0: u32,
    k1: u32,
    k2: u32,
    k3: u32,
) {
    gs.keys[0] = k0;
    gs.keys[1] = k1;
    gs.keys[2] = k2;
    gs.keys[3] = k3;
}
