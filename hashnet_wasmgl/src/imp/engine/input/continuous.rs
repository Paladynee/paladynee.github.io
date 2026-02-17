use super::circle_around_mouse::circle_around_mouse;
use super::collect_nodes::collect_nodes;
use super::converge::converge;
use super::handle_orbit::handle_orbit;
use super::mouse_in_center::mouse_in_center;
use super::nudge::nudge;
use super::random_explosion::random_explosion;
use super::stop::stop;
use super::vim_controls::vim_controls;
use crate::exports::GlobalState;
use core::f32;

/// Processes active keyboard and mouse inputs to trigger specific simulation behaviors.
pub fn handle_continuous_input(gs: &mut GlobalState) {
    for code in gs.held_keys_iter() {
        match code {
            b's' => stop(gs),
            b'a' => converge(gs),
            b'p' => random_explosion(gs),
            b't' => vim_controls(gs, -10.0, 0.0),
            b'y' => vim_controls(gs, 10.0, 0.0),
            b'g' => vim_controls(gs, 0.0, 10.0),
            b'h' => vim_controls(gs, 0.0, -10.0),
            b'f' => nudge(gs),
            b'c' => collect_nodes(gs),
            b'o' => handle_orbit(gs, f32::consts::FRAC_PI_2),
            b'l' => handle_orbit(gs, -f32::consts::FRAC_PI_2),
            b'e' => mouse_in_center(gs),
            b'u' => circle_around_mouse(gs),
            _ => {}
        }
    }
}
