use crate::exports::GAME_OBJECTS_AMT;
use crate::exports::GlobalState;
use crate::exports::Hd;
use crate::exports::Hf;
use crate::exports::IOTA_PTR;
use crate::exports::Vec2f;
use alloc::alloc;
use core::alloc::Layout;
use core::arch::wasm32::f32_ceil;
use core::arch::wasm32::f32_sqrt;
use core::f32;
use core::intrinsics::cosf32;
use core::intrinsics::sinf32;

/// Initializes the simulation library, setting screen dimensions and spawning particles.
///
/// This function sets up the initial particle positions using one of several randomized spawning methods
/// and initializes the global state pointers for the JavaScript side.
pub fn init_lib(gs: &mut GlobalState, screen_width: f32, screen_height: f32, entropy: f64, entropy2: f64) {
    // initialize iota array on the heap
    unsafe {
        const IOTA_ARRAY_ALLOCATION_LAYOUT: Layout = match Layout::array::<usize>(GAME_OBJECTS_AMT) {
            Ok(layout) => layout,
            // either statically panics at compile time or always succeeds
            Err(_) => panic!("Failed to create layout for iota array allocation"),
        };
        let ptr = alloc::alloc(IOTA_ARRAY_ALLOCATION_LAYOUT);
        if ptr.is_null() {
            alloc::handle_alloc_error(IOTA_ARRAY_ALLOCATION_LAYOUT);
        }
        IOTA_PTR = ptr.cast();
    }

    gs.mouse_position = Vec2f {
        x: screen_width / 2.0,
        y: screen_height / 2.0,
    };
    gs.screen_size = [screen_width as _, screen_height as _];

    gs.collect_entropy(Hf(screen_width));
    gs.collect_entropy(Hf(screen_height));
    gs.collect_entropy(Hd(entropy));
    gs.collect_entropy(Hd(entropy2));

    let spawn_method = gs.rand_u32() % 4;
    if spawn_method == 0 {
        // spawn randomly in screen
        for i in 0..GAME_OBJECTS_AMT {
            gs.game_objects.xs[i] = gs.rand_f32() * screen_width;
            gs.game_objects.ys[i] = gs.rand_f32() * screen_height;
        }
    } else if spawn_method == 1 {
        // spawn in a perfect grid uniformly scattered on screen
        let aspect_ratio = screen_width / screen_height;
        let grid_size = f32_sqrt(GAME_OBJECTS_AMT as f32) as usize;
        let grid_size_x = f32_ceil(grid_size as f32 * aspect_ratio) as usize;
        let grid_size_y = f32_ceil(grid_size as f32 / aspect_ratio) as usize;
        let mut i = 0;
        for y in 0..grid_size_y {
            for x in 0..grid_size_x {
                if i >= GAME_OBJECTS_AMT {
                    break;
                }
                gs.game_objects.xs[i] = (x as f32 + 0.5) * screen_width / grid_size_x as f32;
                gs.game_objects.ys[i] = (y as f32 + 0.5) * screen_height / grid_size_y as f32;
                i += 1;
            }
        }
    } else if spawn_method == 2 {
        // spawn in a spiral (phyllotaxis) centered on screen
        let center_x = screen_width / 2.0;
        let center_y = screen_height / 2.0;
        let max_radius = if screen_width < screen_height { screen_width } else { screen_height };
        let golden_angle = 137.50776 * (f32::consts::PI / 180.0);

        for i in 0..GAME_OBJECTS_AMT {
            let r = f32_sqrt(i as f32 / GAME_OBJECTS_AMT as f32) * max_radius;
            let theta = i as f32 * golden_angle;
            let sin = sinf32(theta);
            let cos = cosf32(theta);

            gs.game_objects.xs[i] = center_x + r * cos;
            gs.game_objects.ys[i] = center_y + r * sin;
        }
    } else {
        // spawn in several dense "blobs" (clusters) that can naturally bleed off-screen
        let num_clusters = 8;
        let mut centers_x = [0.0f32; 8];
        let mut centers_y = [0.0f32; 8];
        for i in 0..num_clusters {
            centers_x[i] = gs.rand_f32() * screen_width;
            centers_y[i] = gs.rand_f32() * screen_height;
        }

        for i in 0..GAME_OBJECTS_AMT {
            let c = (gs.rand_u32() % num_clusters as u32) as usize;
            // original tighter radius: min(w, h) * 0.4
            let radius = gs.rand_f32() * gs.rand_f32() * (screen_width.min(screen_height) * 0.4);
            let angle = gs.rand_f32() * 2.0 * f32::consts::PI;
            let sin = sinf32(angle);
            let cos = cosf32(angle);

            // No clamping here allows them to spawn off-screen if the blob is near the edge
            gs.game_objects.xs[i] = centers_x[c] + cos * radius;
            gs.game_objects.ys[i] = centers_y[c] + sin * radius;
        }
    }

    gs.soa_pointers = [
        gs.game_objects.xs.as_mut_ptr(),
        gs.game_objects.ys.as_mut_ptr(),
        gs.game_objects.vxs.as_mut_ptr(),
        gs.game_objects.vys.as_mut_ptr(),
    ];

    gs.color_pointers = [
        gs.game_objects.crs.as_mut_ptr(),
        gs.game_objects.cgs.as_mut_ptr(),
        gs.game_objects.cbs.as_mut_ptr(),
    ];

    gs.unit_size = Vec2f {
        x: 1.0 / screen_width,
        y: 1.0 / screen_width,
    };

    // generate initial random palette
    gs.reset_palette();
    // initially we want colors mixed, not ordered by distance to center
    gs.shuffle_colors();
}
