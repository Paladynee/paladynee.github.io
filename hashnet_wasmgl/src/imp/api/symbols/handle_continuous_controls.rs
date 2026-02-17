use crate::exports::GlobalState;
use crate::exports::handle_continuous_input;

pub fn handle_continuous_controls(gs: &mut GlobalState) {
    handle_continuous_input(gs);
}
