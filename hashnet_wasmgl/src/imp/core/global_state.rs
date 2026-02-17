use crate::exports::FixedState;
use crate::exports::HeldKeysIterator;
use crate::exports::SizedTypeProperties;
use crate::exports::SoaGameObjects;
use crate::exports::Vec2f;
use crate::exports::get_iota_array;
use crate::exports::hsv_base_rgb;
use crate::exports::sorted_global_iota_by_distance;
use crate::exports::xor_shift;
use alloc::alloc;
use core::hash::BuildHasher;
use core::hash::Hash;
use core::ptr;

/// The total number of particle objects in the simulation.
pub const GAME_OBJECTS_AMT: usize = 1024 * 32;

/// The central state registry managing simulation parameters and data.
pub struct GlobalState {
    /// The current 2D position of the mouse cursor.
    pub mouse_position: Vec2f,
    /// The current width and height of the rendering canvas.
    pub screen_size: [i32; 2],
    /// Pointers to the Structure of Arrays (Soa) data for draw properties.
    pub soa_pointers: [*mut f32; 4],
    /// Pointers to the Structure of Arrays (Soa) data for color channels.
    pub color_pointers: [*mut u8; 3],
    /// Scaling factors derived from screen size for unit normalization.
    pub unit_size: Vec2f,
    /// The base RGB color used for the primary palette.
    pub palette_base: [f32; 3],
    /// The complementary RGB color for the primary palette.
    pub anti_palette_base: [f32; 3],
    /// Four RNG lanes (stored as raw bit patterns in `f32`) for scalar and SIMD random generation.
    pub rng_state: [f32; 4],
    /// Hasher state used for collecting entropy from updates.
    pub hasher_state: FixedState,
    /// Bitmask of currently pressed keyboard keys (128 bits).
    pub keys: [u32; 4],
    /// Bitmask of currently pressed mouse buttons.
    pub mouse_buttons: u32,
    /// Whether the simulation is currently paused or "obliterated".
    pub obliterated: bool,
    /// Whether particles should bounce off the canvas edges.
    pub clamping_behavior: bool,
    /// Whether the mouse position should be ignored by the simulation.
    pub mouse_prevent: bool,
    /// The global friction/damping factor applied to all particles.
    pub friction: f32,
    /// The current depth/size of the hashnet connections (legacy parameter).
    pub hashnet_depth: u32,
    /// A heap-allocated structure containing all individual particle data.
    pub game_objects: SoaGameObjects,
}

static mut GLOBAL_STATE: *mut GlobalState = ptr::null_mut();

impl GlobalState {
    /// Initializes a pre-allocated `GlobalState` at `p` with default values.
    ///
    /// # Safety
    ///
    /// `p` must be valid for writes of `GlobalState`, properly aligned, and not aliased
    /// for mutable access while this function runs.
    pub unsafe fn init_into_ptr(p: *mut Self) {
        unsafe {
            macro_rules! write_fields {
                ($ptr:expr; $($field:ident = $value:expr),+ $(,)?) => {
                    $((&raw mut (*$ptr).$field).write($value);)+
                };
            }

            write_fields!(p;
                // later gets overwritten by `init_lib` call from javascript.
                mouse_position = Vec2f { x: 0.0, y: 0.0 },
                // later gets overwritten by `init_lib` call from javascript.
                screen_size = [1280, 720],
                // later gets overwritten by `init_lib` call from javascript.
                soa_pointers = [ptr::null_mut(); 4],
                // later gets overwritten by `init_lib` call from javascript.
                color_pointers = [ptr::null_mut::<u8>(); 3],
                // later gets overwritten by `init_lib` call from javascript.
                unit_size = Vec2f {
                    x: 1.0 / 1280.0,
                    y: 1.0 / 1280.0,
                },
                // later gets overwritten by `init_lib` call from javascript.
                palette_base = [1.0, 0.0, 0.0],
                // later gets overwritten by `init_lib` call from javascript.
                anti_palette_base = [0.0, 1.0, 1.0],
                // later gets overwritten by `collect_entropy` calls.
                rng_state = [
                    f32::from_bits(0xa57b329c),
                    f32::from_bits(0x9e3779b9),
                    f32::from_bits(0x243f6a88),
                    f32::from_bits(0xb7e15162),
                ],
                hasher_state = FixedState::with_seed(0xbca8340a),
                keys = [0; 4],
                mouse_buttons = 0,
                obliterated = false,
                clamping_behavior = false,
                mouse_prevent = false,
                friction = 0.5,
                hashnet_depth = 3,
            );

            let game_objects_ptr = &raw mut (*p).game_objects;
            SoaGameObjects::init_into_pointer(game_objects_ptr);
        }
    }

    /// Updates the internal RNG state by hashing a new value.
    pub fn collect_entropy<T: Hash>(&mut self, val: T) {
        let hash = self.hasher_state.hash_one(val);
        let h0 = hash as u32;
        let h1 = (hash >> 32) as u32;
        let mut lane0 = self.rng_state[0].to_bits();
        let mut lane1 = self.rng_state[1].to_bits();
        let mut lane2 = self.rng_state[2].to_bits();
        let mut lane3 = self.rng_state[3].to_bits();

        lane0 ^= h0;
        lane1 ^= h1;
        lane2 ^= h0.rotate_left(13);
        lane3 ^= h1.rotate_right(7);

        self.rng_state[0] = f32::from_bits(lane0);
        self.rng_state[1] = f32::from_bits(lane1);
        self.rng_state[2] = f32::from_bits(lane2);
        self.rng_state[3] = f32::from_bits(lane3);
    }

    /// Generates and returns a pseudo-random 32-bit unsigned integer.
    pub fn rand_u32(&mut self) -> u32 {
        let state = self.rng_state[0].to_bits();
        let next = xor_shift(state);
        self.rng_state[0] = f32::from_bits(next);
        next
    }

    /// Generates and returns a pseudo-random 64-bit unsigned integer.
    pub fn rand_u64(&mut self) -> u64 {
        let high = self.rand_u32() as u64;
        let low = self.rand_u32() as u64;
        (high << 32) | low
    }

    /// Generates and returns a pseudo-random architecture-sized unsigned integer.
    pub fn rand_usize(&mut self) -> usize {
        if usize::SIZE == 8 {
            self.rand_u64() as usize
        } else {
            self.rand_u32() as usize
        }
    }

    /// Generates and returns a pseudo-random 32-bit float in the range [0.0, 1.0].
    pub fn rand_f32(&mut self) -> f32 {
        let u = self.rand_u32();
        (u as f32) / (u32::MAX as f32)
    }

    /// Generates four pseudo-random floats in the range [0.0, 1.0].
    pub fn rand_f32x4(&mut self) -> [f32; 4] {
        const INV_U32_MAX: f32 = 1.0 / (u32::MAX as f32);
        let mut out = [0.0; 4];

        let mut i = 0;
        while i < 4 {
            let state = self.rng_state[i].to_bits();
            let next = xor_shift(state);
            self.rng_state[i] = f32::from_bits(next);
            out[i] = (next as f32) * INV_U32_MAX;
            i += 1;
        }

        out
    }

    /// Randomizes the color palette and applies it to all game objects.
    pub fn reset_palette(&mut self) {
        let rand = self.rand_u32();
        let hue = (rand as f32 / u32::MAX as f32) * 360.0;
        self.palette_base = hsv_base_rgb(hue);
        self.anti_palette_base = hsv_base_rgb((hue + 180.0) % 360.0);
        apply_palette_colors(self);
    }

    /// Randomly swaps the color components across game objects.
    pub fn shuffle_colors(&mut self) {
        let mut i = GAME_OBJECTS_AMT - 1;
        while i > 0 {
            let j = self.rand_usize() % (i + 1);
            unsafe {
                SoaGameObjects::soa_field_swap(&mut self.game_objects.crs, i, j);
                SoaGameObjects::soa_field_swap(&mut self.game_objects.cgs, i, j);
                SoaGameObjects::soa_field_swap(&mut self.game_objects.cbs, i, j);
            }
            i -= 1;
        }
    }

    /// Returns a mutable reference to the singleton `GlobalState`, initializing it if necessary.
    ///
    /// # Safety
    /// This function is unsafe because it provides access to a global mutable static.
    #[inline(always)]
    pub unsafe fn get_mut<'s>() -> &'s mut GlobalState {
        // NOTE: if parallelizm is added, this should have a global lock.
        // otherwise, data races are possible, since we assume single threadedness.
        unsafe {
            if GLOBAL_STATE.is_null() {
                Self::allocate_and_init_global_state();
            }
            &mut *GLOBAL_STATE
        }
    }

    /// Allocates memory for and initializes the global singleton state.
    ///
    /// # Safety
    /// This function is unsafe as it performs manual memory allocation and writes to a global static.
    #[cold]
    #[inline(never)]
    pub unsafe fn allocate_and_init_global_state() {
        unsafe {
            let p = alloc::alloc(GlobalState::LAYOUT);
            if p.is_null() {
                alloc::handle_alloc_error(GlobalState::LAYOUT);
            }
            GLOBAL_STATE = p as *mut GlobalState;
            GlobalState::init_into_ptr(GLOBAL_STATE);
        }
    }

    pub fn held_keys_iter(&self) -> HeldKeysIterator {
        HeldKeysIterator {
            keys: self.keys,
            current_idx: 0,
            current_bit: 0,
        }
    }
}

/// Re-calculates and assigns color values to the entire particle array based on the current palette.
///
/// Colors are assigned by distance rank to the cursor while preserving game object storage/draw order.
fn apply_palette_colors(gs: &mut GlobalState) {
    if GAME_OBJECTS_AMT == 0 {
        return;
    }

    let [br, bg, bb] = gs.palette_base;
    let mpx = gs.mouse_position.x;
    let mpy = gs.mouse_position.y;

    let order = unsafe {
        sorted_global_iota_by_distance(&gs.game_objects.xs, &gs.game_objects.ys, [mpx, mpy]);
        get_iota_array()
    };

    if GAME_OBJECTS_AMT == 1 {
        unsafe {
            *gs.game_objects.crs.get_unchecked_mut(0) = (br * 255.0) as u8;
            *gs.game_objects.cgs.get_unchecked_mut(0) = (bg * 255.0) as u8;
            *gs.game_objects.cbs.get_unchecked_mut(0) = (bb * 255.0) as u8;
        }
    } else {
        const DENOM: f32 = (GAME_OBJECTS_AMT - 1) as f32;
        let mut i = 0;
        while i < GAME_OBJECTS_AMT {
            let idx = unsafe { *order.get_unchecked(i) };
            let v = 1.0 - (i as f32 / DENOM);

            unsafe {
                *gs.game_objects.crs.get_unchecked_mut(idx) = (br * v * 255.0) as u8;
                *gs.game_objects.cgs.get_unchecked_mut(idx) = (bg * v * 255.0) as u8;
                *gs.game_objects.cbs.get_unchecked_mut(idx) = (bb * v * 255.0) as u8;
            }
            i += 1;
        }
    }
}
