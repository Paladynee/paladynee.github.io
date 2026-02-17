//! Re-exports of key types and functions for internal and external use.

pub use crate::imp::api::imports::*;
pub use crate::imp::core::global_state::GAME_OBJECTS_AMT;
pub use crate::imp::core::global_state::GlobalState;
pub use crate::imp::core::properties::SizedTypeProperties;
pub use crate::imp::engine::input::HeldKeysIterator;
pub use crate::imp::engine::input::handle_continuous_input;
pub use crate::imp::engine::input::handle_tactile_input;
pub use crate::imp::engine::objects::IOTA_PTR;
pub use crate::imp::engine::objects::SoaGameObjects;
pub use crate::imp::engine::objects::get_iota_array;
pub use crate::imp::engine::objects::get_iota_array_mut;
pub use crate::imp::engine::objects::sorted_global_iota_by_distance;
pub use crate::imp::engine::physics::USE_MANUAL_SIMD;
pub use crate::imp::engine::physics::update_physics;
pub use crate::imp::engine::simd_math;
pub use crate::imp::math::color::hsv_base_rgb;
pub use crate::imp::math::hashablefloat::Hd;
pub use crate::imp::math::hashablefloat::Hf;
pub use crate::imp::math::random::xor_shift;
pub use crate::imp::math::vec2::Vec2f;
pub use foldhash::fast::FixedState;
