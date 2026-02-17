use crate::exports::GAME_OBJECTS_AMT;

/// Returns the total number of objects in the simulation.
pub fn get_amount_objects() -> i32 {
    GAME_OBJECTS_AMT as i32
}
