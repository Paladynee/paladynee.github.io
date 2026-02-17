use crate::exports::GAME_OBJECTS_AMT;
use core::mem;
use core::ptr;

pub static mut IOTA_PTR: *mut [usize; GAME_OBJECTS_AMT] = ptr::null_mut();

/// # Safety
///
/// Returns a reference to a mutable static. Beware of the lifetime.
pub unsafe fn get_iota_array_mut<'s>() -> &'s mut [usize; GAME_OBJECTS_AMT] {
    unsafe { &mut *IOTA_PTR }
}
/// # Safety
///
/// Returns a reference to a mutable static. Beware of the lifetime.
pub unsafe fn get_iota_array<'s>() -> &'s [usize; GAME_OBJECTS_AMT] {
    unsafe { &*IOTA_PTR }
}

/// Structure of Arrays (SoA) layout for particle simulation data.
pub struct SoaGameObjects {
    /// Horizontal positions of all particles.
    pub xs: [f32; GAME_OBJECTS_AMT],
    /// Vertical positions of all particles.
    pub ys: [f32; GAME_OBJECTS_AMT],
    /// Horizontal velocities of all particles.
    pub vxs: [f32; GAME_OBJECTS_AMT],
    /// Vertical velocities of all particles.
    pub vys: [f32; GAME_OBJECTS_AMT],
    /// Red color components of all particles.
    pub crs: [u8; GAME_OBJECTS_AMT],
    /// Green color components of all particles.
    pub cgs: [u8; GAME_OBJECTS_AMT],
    /// Blue color components of all particles.
    pub cbs: [u8; GAME_OBJECTS_AMT],
}

/// Represents a single particle as an Array of Structures (AoS) temporary.
pub struct GameObject {
    /// The horizontal position.
    pub x: f32,
    /// The vertical position.
    pub y: f32,
    /// The horizontal velocity.
    pub vx: f32,
    /// The vertical velocity.
    pub vy: f32,
    /// The red color channel.
    pub cr: u8,
    /// The green color channel.
    pub cg: u8,
    /// The blue color channel.
    pub cb: u8,
}

// fn iota_array<const N: usize>() -> Box<[usize; N]> {
//     unsafe {
//         let p = alloc::alloc::alloc_zeroed(<[usize; N]>::LAYOUT);
//         if p.is_null() {
//             alloc::alloc::handle_alloc_error(<[usize; N]>::LAYOUT);
//         }
//         let slice = core::slice::from_raw_parts_mut(p as *mut usize, N);
//         for i in 0..N {
//             *slice.get_unchecked_mut(i) = i;
//         }
//         Box::from_raw(p as *mut [usize; N])
//     }
// }

/// Populates a slice with incremental values starting from 0.
///
/// Returns the modified slice.
fn make_iota(slice: &mut [usize]) -> &mut [usize] {
    for (i, num) in slice.iter_mut().enumerate() {
        *num = i;
    }
    slice
}

/// Sets the global reusable index buffer sorted by distance to `mouse_pos` (nearest first).
/// Get with `unsafe { &IOTA_ARRAY_ALLOCATION }`.
///
/// # Safety
/// This mutates a global static buffer and assumes single-threaded access.
pub unsafe fn sorted_global_iota_by_distance(xs: &[f32; GAME_OBJECTS_AMT], ys: &[f32; GAME_OBJECTS_AMT], mouse_pos: [f32; 2]) {
    let [mx, my] = mouse_pos;
    let indices = make_iota(unsafe { get_iota_array_mut() });

    indices.sort_unstable_by(|&a, &b| {
        let dxa = unsafe { *xs.get_unchecked(a) } - mx;
        let dya = unsafe { *ys.get_unchecked(a) } - my;
        let dxb = unsafe { *xs.get_unchecked(b) } - mx;
        let dyb = unsafe { *ys.get_unchecked(b) } - my;

        let da = dxa * dxa + dya * dya;
        let db = dxb * dxb + dyb * dyb;

        unsafe { da.partial_cmp(&db).unwrap_unchecked() }
    });
}

impl SoaGameObjects {
    /// Should be non-zeroed.
    ///
    /// # Safety
    ///
    /// Must be valid for writes, and not aliased when called.
    pub unsafe fn init_into_pointer(p: *mut Self) {
        macro_rules! all {
            ($(
                $FieldName:ident = $DefaultValue:expr
            ),*) => {$(
                // TODO: investigate whether separate memsets for each field or
                // looping over the game objects once is faster
                for i in 0..GAME_OBJECTS_AMT {
                    *(*p).$FieldName.get_unchecked_mut(i) = $DefaultValue;
                }
            )*};
        }
        unsafe {
            all!(
                xs = 0.0,
                ys = 0.0,
                vxs = 0.0,
                vys = 0.0,
                crs = 255,
                cgs = 255,
                cbs = 255
            );
        }
    }

    /// Sorts particles by distance from the mouse cursor using an efficient in-place cycle-following algorithm.
    pub fn sort_perf(&mut self, mouse_pos: [f32; 2]) {
        let indices = make_iota(unsafe { get_iota_array_mut() });

        indices.sort_unstable_by(|&a, &b| unsafe {
            let dist_b = self.dist_sq(b, mouse_pos);
            let dist_a = self.dist_sq(a, mouse_pos);
            dist_b.total_cmp(&dist_a)
        });

        // cycle following algorithm
        // basically the after sorting the indices we have
        // disjoint cycles (like we do in the 100 prisoners problem)
        // and we just follow the cycles and swap the objects in place
        // and skip if the cycle is already traversed by checking this bit.
        const DONE_BIT: usize = 1 << (usize::BITS - 1);
        for i in 0..GAME_OBJECTS_AMT {
            let idx = unsafe { *indices.get_unchecked(i) };
            if (idx & DONE_BIT) != 0 || idx == i {
                continue;
            }

            let mut current = i;
            unsafe {
                let tmp = self.get_gameobject_unchecked(i);
                loop {
                    let next = *indices.get_unchecked(current);
                    *indices.get_unchecked_mut(current) |= DONE_BIT;

                    if next == i {
                        self.set_gameobject_unchecked(current, tmp);
                        break;
                    }

                    let next_obj = self.get_gameobject_unchecked(next);
                    self.set_gameobject_unchecked(current, next_obj);
                    current = next;
                }
            }
        }
    }

    /// Returns the squared distance between a particle at a given index and a point.
    ///
    /// # Safety
    /// This function is unsafe because it performs unchecked indexing into the position arrays.
    #[inline(always)]
    unsafe fn dist_sq(&self, i: usize, mouse_pos: [f32; 2]) -> f32 {
        unsafe {
            let dx = *self.xs.get_unchecked(i) - mouse_pos[0];
            let dy = *self.ys.get_unchecked(i) - mouse_pos[1];
            dx * dx + dy * dy
        }
    }

    /// Swaps all data components for the particles at the two specified indices.
    ///
    /// # Safety
    /// This function is unsafe because it performs multiple unchecked swaps.
    #[inline(always)]
    unsafe fn swap_objects(&mut self, i: usize, j: usize) {
        unsafe {
            Self::soa_field_swap(&mut self.xs, i, j);
            Self::soa_field_swap(&mut self.ys, i, j);
            Self::soa_field_swap(&mut self.vxs, i, j);
            Self::soa_field_swap(&mut self.vys, i, j);
            Self::soa_field_swap(&mut self.crs, i, j);
            Self::soa_field_swap(&mut self.cgs, i, j);
            Self::soa_field_swap(&mut self.cbs, i, j);
        }
    }

    /// Sorts particles by distance from the mouse cursor using a Shell sort variant optimized for code size.
    pub fn sort(&mut self, mouse_pos: [f32; 2]) {
        let (mut a, mut b) = (1usize, 2usize);
        while unsafe { a.unchecked_mul(b) } < self.xs.len() {
            let new_b = unsafe { a.unchecked_mul(2).unchecked_add(1) };
            (a, b) = (b, new_b);
        }
        while b > 1 {
            (a, b) = (b / 2, a);
            let g = unsafe { a.unchecked_mul(b) };
            for mut i in g..self.xs.len() {
                while i >= g && {
                    let dist_i = unsafe { self.dist_sq(i - g, mouse_pos) };
                    let dist_j = unsafe { self.dist_sq(i, mouse_pos) };
                    dist_i > dist_j
                } {
                    unsafe {
                        self.swap_objects(i, i.unchecked_sub(g));
                    }
                    i -= g;
                }
            }
        }
    }

    /// Retrieves all data for a single particle at the given index as a `GameObject` struct.
    ///
    /// # Safety
    /// This function is unsafe because it performs unchecked indexing.
    #[inline(always)]
    unsafe fn get_gameobject_unchecked(&self, i: usize) -> GameObject {
        unsafe {
            GameObject {
                x: *self.xs.get_unchecked(i),
                y: *self.ys.get_unchecked(i),
                vx: *self.vxs.get_unchecked(i),
                vy: *self.vys.get_unchecked(i),
                cr: *self.crs.get_unchecked(i),
                cg: *self.cgs.get_unchecked(i),
                cb: *self.cbs.get_unchecked(i),
            }
        }
    }

    /// Overwrites all data for a single particle at the given index with the provided `GameObject`.
    ///
    /// # Safety
    /// This function is unsafe because it performs unchecked indexing.
    #[inline(always)]
    unsafe fn set_gameobject_unchecked(
        &mut self,
        i: usize,
        GameObject {
            x,
            y,
            vx,
            vy,
            cr,
            cg,
            cb,
            // destructured to catch any new fields.
        }: GameObject,
    ) {
        unsafe {
            *self.xs.get_unchecked_mut(i) = x;
            *self.ys.get_unchecked_mut(i) = y;
            *self.vxs.get_unchecked_mut(i) = vx;
            *self.vys.get_unchecked_mut(i) = vy;
            *self.crs.get_unchecked_mut(i) = cr;
            *self.cgs.get_unchecked_mut(i) = cg;
            *self.cbs.get_unchecked_mut(i) = cb;
        }
    }

    /// Swaps the elements at two indices in the given slice.
    ///
    /// # Safety
    /// This function is unsafe because it performs manual pointer arithmetic and assumes the indices are within bounds.
    #[allow(clippy::swap_ptr_to_ref)]
    pub unsafe fn soa_field_swap<T>(slice: &mut [T], i: usize, j: usize) {
        unsafe {
            let ptr = slice.as_mut_ptr();
            let a = ptr.add(i);
            let b = ptr.add(j);
            mem::swap(&mut *a, &mut *b);
        }
    }
}
