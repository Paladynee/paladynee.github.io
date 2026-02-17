use crate::exports::GlobalState;
use crate::exports::Hf;
use crate::exports::Vec2f;
use core::arch::wasm32::f32_sqrt;
use core::arch::wasm32::f32x4_add;
use core::arch::wasm32::f32x4_convert_i32x4;
use core::arch::wasm32::f32x4_div;
use core::arch::wasm32::f32x4_eq;
use core::arch::wasm32::f32x4_extract_lane;
use core::arch::wasm32::f32x4_gt;
use core::arch::wasm32::f32x4_lt;
use core::arch::wasm32::f32x4_max;
use core::arch::wasm32::f32x4_min;
use core::arch::wasm32::f32x4_mul;
use core::arch::wasm32::f32x4_splat;
use core::arch::wasm32::f32x4_sqrt;
use core::arch::wasm32::f32x4_sub;
use core::arch::wasm32::i32x4_splat;
use core::arch::wasm32::i32x4_sub;
use core::arch::wasm32::v128_and;
use core::arch::wasm32::v128_load;
use core::arch::wasm32::v128_or;
use core::arch::wasm32::v128_store;
use core::hint::assert_unchecked;
use core::intrinsics::powf32;

const FAST_INVERSE_THING: bool = true;
pub const USE_MANUAL_SIMD: bool = true;

/// Updates the physical state of all particles for a given time step.
///
/// This involves calculating attraction to the mouse position, updating velocities with damping,
/// and integrating positions based on the time delta `dt`.
pub fn update_physics(gs: &mut GlobalState, dt: f32) {
    if gs.obliterated {
        return;
    }
    gs.collect_entropy(Hf(dt));
    // basically friction ^ dt
    let damping = powf32(gs.friction, dt);
    let sw = gs.screen_size[0] as f32;
    let sh = gs.screen_size[1] as f32;
    unsafe {
        assert_unchecked(!f32::is_nan(sw));
        assert_unchecked(!f32::is_nan(sh));
        assert_unchecked(0.0 <= sw);
        assert_unchecked(0.0 <= sh);
    }

    if gs.clamping_behavior {
        update_physics_kernel::<true>(gs, dt, damping, sw, sh);
    } else {
        update_physics_kernel::<false>(gs, dt, damping, sw, sh);
    }
}

#[inline(always)]
unsafe fn clamp_unchecked(value: f32, lo: f32, hi: f32) -> f32 {
    debug_assert!(lo <= hi);
    let clamped = f32x4_min(f32x4_max(f32x4_splat(value), f32x4_splat(lo)), f32x4_splat(hi));
    f32x4_extract_lane::<0>(clamped)
}

#[inline(always)]
fn update_physics_kernel<const CLAMP: bool>(gs: &mut GlobalState, dt: f32, damping: f32, sw: f32, sh: f32) {
    if USE_MANUAL_SIMD {
        update_physics_kernel_simd::<CLAMP>(gs, dt, damping, sw, sh);
        return;
    }

    update_physics_kernel_scalar::<CLAMP>(gs, dt, damping, sw, sh);
}

#[inline(always)]
#[allow(clippy::too_many_arguments)]
unsafe fn update_particle_scalar<const CLAMP: bool>(
    gs: &mut GlobalState,
    i: usize,
    dt: f32,
    damping: f32,
    sw: f32,
    sh: f32,
    mpx: f32,
    mpy: f32,
    usx: f32,
    usy: f32,
) {
    let x = unsafe { gs.game_objects.xs.get_unchecked_mut(i) };
    let y = unsafe { gs.game_objects.ys.get_unchecked_mut(i) };
    let vx = unsafe { gs.game_objects.vxs.get_unchecked_mut(i) };
    let vy = unsafe { gs.game_objects.vys.get_unchecked_mut(i) };
    let ax = unsafe { gs.game_objects.axs.get_unchecked_mut(i) };
    let ay = unsafe { gs.game_objects.ays.get_unchecked_mut(i) };

    *ax = (mpx - *x) * usx;
    *ay = (mpy - *y) * usy;

    let mag_sq = *ax * *ax + *ay * *ay;
    let d = mag_sq + 0.1;
    let factor = if FAST_INVERSE_THING {
        let mut y = f32::from_bits(0x7ef311c2u32.wrapping_sub(d.to_bits()));
        y *= 2.0 - d * y;
        1000.0 * y
    } else {
        1000.0 / d
    };

    let is_zero = (mag_sq == 0.0) as u8 as f32;
    let inv_len = 1.0 / f32_sqrt(mag_sq + is_zero);
    *ax *= inv_len;
    *ay *= inv_len;

    *ax *= factor;
    *ay *= factor;

    *vx += *ax * dt;
    *vy += *ay * dt;

    *vx *= damping;
    *vy *= damping;

    *x += *vx * dt;
    *y += *vy * dt;

    if CLAMP {
        let x_oob = ((*x < 0.0) || (*x > sw)) as u8 as f32;
        let y_oob = ((*y < 0.0) || (*y > sh)) as u8 as f32;
        let x_sign = 1.0 - 2.0 * x_oob;
        let y_sign = 1.0 - 2.0 * y_oob;

        *vx *= x_sign;
        *vy *= y_sign;
        *x = unsafe { clamp_unchecked(*x, 0.0, sw) };
        *y = unsafe { clamp_unchecked(*y, 0.0, sh) };
    }
}

#[inline(always)]
fn update_physics_kernel_scalar<const CLAMP: bool>(gs: &mut GlobalState, dt: f32, damping: f32, sw: f32, sh: f32) {
    let Vec2f { x: mpx, y: mpy } = gs.mouse_position;
    let Vec2f { x: usx, y: usy } = gs.unit_size;

    let mut i = 0;
    while i < gs.game_objects.xs.len() {
        unsafe {
            update_particle_scalar::<CLAMP>(gs, i, dt, damping, sw, sh, mpx, mpy, usx, usy);
        }
        i += 1;
    }
}

// #[cfg(target_arch = "wasm32")]
// #[inline(always)]
// fn update_physics_kernel_simd<const CLAMP: bool>(gs: &mut GlobalState, dt: f32, damping: f32, sw: f32, sh: f32) {
//     let Vec2f { x: mpx, y: mpy } = gs.mouse_position;
//     let Vec2f { x: usx, y: usy } = gs.unit_size;

//     let len = gs.game_objects.xs.len();

//     let xs_ptr = gs.game_objects.xs.as_mut_ptr();
//     let ys_ptr = gs.game_objects.ys.as_mut_ptr();
//     let vxs_ptr = gs.game_objects.vxs.as_mut_ptr();
//     let vys_ptr = gs.game_objects.vys.as_mut_ptr();
//     let axs_ptr = gs.game_objects.axs.as_mut_ptr();
//     let ays_ptr = gs.game_objects.ays.as_mut_ptr();

//     let mpxv = f32x4_splat(mpx);
//     let mpyv = f32x4_splat(mpy);
//     let usxv = f32x4_splat(usx);
//     let usyv = f32x4_splat(usy);
//     let dtv = f32x4_splat(dt);
//     let dampingv = f32x4_splat(damping);

//     let zero = f32x4_splat(0.0);
//     let one = f32x4_splat(1.0);
//     let two = f32x4_splat(2.0);
//     let point_one = f32x4_splat(0.1);
//     let thousand = f32x4_splat(1000.0);

//     let swv = f32x4_splat(sw);
//     let shv = f32x4_splat(sh);

//     let inv_const_bits = i32x4_splat(0x7ef311c2u32 as i32);
//     let one_i = i32x4_splat(1);

//     let mut i = 0usize;
//     while i + 4 <= len {
//         unsafe {
//             let x = v128_load(xs_ptr.add(i) as *const _);
//             let y = v128_load(ys_ptr.add(i) as *const _);
//             let mut vx = v128_load(vxs_ptr.add(i) as *const _);
//             let mut vy = v128_load(vys_ptr.add(i) as *const _);

//             let mut ax = f32x4_mul(f32x4_sub(mpxv, x), usxv);
//             let mut ay = f32x4_mul(f32x4_sub(mpyv, y), usyv);

//             let mag_sq = f32x4_add(f32x4_mul(ax, ax), f32x4_mul(ay, ay));
//             let d = f32x4_add(mag_sq, point_one);

//             let factor = if FAST_INVERSE_THING {
//                 let mut y_approx = i32x4_sub(inv_const_bits, d);
//                 y_approx = f32x4_mul(y_approx, f32x4_sub(two, f32x4_mul(d, y_approx)));
//                 f32x4_mul(thousand, y_approx)
//             } else {
//                 f32x4_div(thousand, d)
//             };

//             let is_zero_mask = f32x4_eq(mag_sq, zero);
//             let is_zero = f32x4_convert_i32x4(v128_and(is_zero_mask, one_i));
//             let inv_len = f32x4_div(one, f32x4_sqrt(f32x4_add(mag_sq, is_zero)));

//             ax = f32x4_mul(f32x4_mul(ax, inv_len), factor);
//             ay = f32x4_mul(f32x4_mul(ay, inv_len), factor);

//             vx = f32x4_mul(f32x4_add(vx, f32x4_mul(ax, dtv)), dampingv);
//             vy = f32x4_mul(f32x4_add(vy, f32x4_mul(ay, dtv)), dampingv);

//             v128_store(axs_ptr.add(i) as *mut _, ax);
//             v128_store(ays_ptr.add(i) as *mut _, ay);

//             let mut new_x = f32x4_add(x, f32x4_mul(vx, dtv));
//             let mut new_y = f32x4_add(y, f32x4_mul(vy, dtv));

//             if CLAMP {
//                 let x_oob_mask = v128_or(f32x4_lt(new_x, zero), f32x4_gt(new_x, swv));
//                 let y_oob_mask = v128_or(f32x4_lt(new_y, zero), f32x4_gt(new_y, shv));

//                 let x_oob = f32x4_convert_i32x4(v128_and(x_oob_mask, one_i));
//                 let y_oob = f32x4_convert_i32x4(v128_and(y_oob_mask, one_i));

//                 let x_sign = f32x4_sub(one, f32x4_mul(two, x_oob));
//                 let y_sign = f32x4_sub(one, f32x4_mul(two, y_oob));

//                 vx = f32x4_mul(vx, x_sign);
//                 vy = f32x4_mul(vy, y_sign);

//                 new_x = f32x4_min(f32x4_max(new_x, zero), swv);
//                 new_y = f32x4_min(f32x4_max(new_y, zero), shv);
//             }

//             v128_store(vxs_ptr.add(i) as *mut _, vx);
//             v128_store(vys_ptr.add(i) as *mut _, vy);
//             v128_store(xs_ptr.add(i) as *mut _, new_x);
//             v128_store(ys_ptr.add(i) as *mut _, new_y);
//         }

//         i += 4;
//     }

//     while i < len {
//         unsafe {
//             update_particle_scalar::<CLAMP>(gs, i, dt, damping, sw, sh, mpx, mpy, usx, usy);
//         }
//         i += 1;
//     }
// }

#[inline(always)]
fn update_physics_kernel_simd<const CLAMP: bool>(gs: &mut GlobalState, dt: f32, damping: f32, sw: f32, sh: f32) {
    unsafe {
        let Vec2f { x: mpx, y: mpy } = gs.mouse_position;
        let Vec2f { x: usx, y: usy } = gs.unit_size;

        let len = gs.game_objects.xs.len();
        let xs_ptr = gs.game_objects.xs.as_mut_ptr();
        let ys_ptr = gs.game_objects.ys.as_mut_ptr();
        let vxs_ptr = gs.game_objects.vxs.as_mut_ptr();
        let vys_ptr = gs.game_objects.vys.as_mut_ptr();
        let axs_ptr = gs.game_objects.axs.as_mut_ptr();
        let ays_ptr = gs.game_objects.ays.as_mut_ptr();

        let mpxv = f32x4_splat(mpx);
        let mpyv = f32x4_splat(mpy);
        let usxv = f32x4_splat(usx);
        let usyv = f32x4_splat(usy);
        let dtv = f32x4_splat(dt);
        let dampingv = f32x4_splat(damping);
        let swv = f32x4_splat(sw);
        let shv = f32x4_splat(sh);

        let zero = f32x4_splat(0.0);
        let one = f32x4_splat(1.0);
        let neg_one = f32x4_splat(-1.0);
        let two = f32x4_splat(2.0);
        let point_one = f32x4_splat(0.1);
        let thousand = f32x4_splat(1000.0);

        let inv_const_bits = i32x4_splat(0x7ef311c2u32 as i32);

        let mut i = 0usize;
        while i + 4 <= len {
            let x = v128_load(xs_ptr.add(i) as *const _);
            let y = v128_load(ys_ptr.add(i) as *const _);
            let mut vx = v128_load(vxs_ptr.add(i) as *const _);
            let mut vy = v128_load(vys_ptr.add(i) as *const _);

            let mut ax = f32x4_mul(f32x4_sub(mpxv, x), usxv);
            let mut ay = f32x4_mul(f32x4_sub(mpyv, y), usyv);

            let mag_sq = f32x4_add(f32x4_mul(ax, ax), f32x4_mul(ay, ay));

            let d = f32x4_add(mag_sq, point_one);

            let factor = if FAST_INVERSE_THING {
                let mut y_approx = i32x4_sub(inv_const_bits, d);
                let d_times_y = f32x4_mul(d, y_approx);
                y_approx = f32x4_mul(y_approx, f32x4_sub(two, d_times_y));
                f32x4_mul(thousand, y_approx)
            } else {
                f32x4_div(thousand, d)
            };

            let is_zero_mask = f32x4_eq(mag_sq, zero);

            let is_zero_val = v128_and(is_zero_mask, one);

            let inv_len = f32x4_div(one, f32x4_sqrt(f32x4_add(mag_sq, is_zero_val)));

            let norm_factor = f32x4_mul(inv_len, factor);
            ax = f32x4_mul(ax, norm_factor);
            ay = f32x4_mul(ay, norm_factor);

            v128_store(axs_ptr.add(i) as *mut _, ax);
            v128_store(ays_ptr.add(i) as *mut _, ay);

            vx = f32x4_mul(f32x4_add(vx, f32x4_mul(ax, dtv)), dampingv);
            vy = f32x4_mul(f32x4_add(vy, f32x4_mul(ay, dtv)), dampingv);

            let mut new_x = f32x4_add(x, f32x4_mul(vx, dtv));
            let mut new_y = f32x4_add(y, f32x4_mul(vy, dtv));

            if CLAMP {
                use core::arch::wasm32::v128_bitselect;

                let x_oob_mask = v128_or(f32x4_lt(new_x, zero), f32x4_gt(new_x, swv));
                let y_oob_mask = v128_or(f32x4_lt(new_y, zero), f32x4_gt(new_y, shv));

                let x_sign = v128_bitselect(neg_one, one, x_oob_mask);
                let y_sign = v128_bitselect(neg_one, one, y_oob_mask);

                vx = f32x4_mul(vx, x_sign);
                vy = f32x4_mul(vy, y_sign);

                new_x = f32x4_min(f32x4_max(new_x, zero), swv);
                new_y = f32x4_min(f32x4_max(new_y, zero), shv);
            }

            v128_store(vxs_ptr.add(i) as *mut _, vx);
            v128_store(vys_ptr.add(i) as *mut _, vy);
            v128_store(xs_ptr.add(i) as *mut _, new_x);
            v128_store(ys_ptr.add(i) as *mut _, new_y);

            i += 4;
        }

        while i < len {
            update_particle_scalar::<CLAMP>(gs, i, dt, damping, sw, sh, mpx, mpy, usx, usy);
            i += 1;
        }
    }
}
