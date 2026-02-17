use std::{
    cmp::Ordering,
    f64::consts::{PI, SQRT_2},
};

use ahash::AHashSet;
use js_sys::Float64Array;
use rand::Rng;
use wasm_bindgen::prelude::*;

#[allow(unused)]
use log::{error, info, warn};
use wasm_bindgen_console_logger::DEFAULT_LOGGER;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

mod vec2;
use vec2::rsVector2;

mod helpers;
use helpers::{generate_hsv_lum_palette, square_at, Hsv};

#[wasm_bindgen]
pub struct GameObject {
    position: rsVector2,
    velocity: rsVector2,
    acceleration: rsVector2,
    size: rsVector2,
    friction: f64,
}

#[wasm_bindgen]
pub struct GameState {
    objects: Vec<GameObject>,
    palette: Vec<Hsv>,
    anti_palette: Vec<Hsv>,
    pub object_amount: usize,
    mouse_position: rsVector2,
    hashnet_size: usize,
    time_dilation: f64,
    held_keys: AHashSet<String>,
    timer: f64,
    pub canvas_w: f64,
    pub canvas_h: f64,
    pub help_menu: bool,
    pub mouse_prevent: bool,
    pub obliterated: bool,
    pub clamping_behavior: bool,
    pub line_offset: f64,
    pub grid_divisor: f64,
    pub grid_spacing_px: f64,
    pub physics_resolution: f64,
    pub neo_physics_handler: bool,
    rand: rand::rngs::ThreadRng,
    // render_information: Vec<RenderInformation>,
}

#[wasm_bindgen]
impl GameState {
    pub fn new(
        object_amount: usize,
        canvas_w: f64,
        canvas_h: f64,
        mouse_position: rsVector2,
        hashnet_size: usize,
        time_dilation: f64,
        start_time: f64,
    ) -> Self {
        log::set_logger(&DEFAULT_LOGGER).unwrap();
        log::set_max_level(log::LevelFilter::Trace);

        let mut objects = Vec::new();
        let mut rand = rand::thread_rng();

        for _ in 0..object_amount {
            let pos = rsVector2::new(rand.gen_range(0.0..canvas_w), rand.gen_range(0.0..canvas_h));

            let vel = rsVector2::new(0.0, 0.0);
            let acc = rsVector2::new(0.0, 0.0);
            let size = rsVector2::new(10.0, 10.0);

            let friction = 0.5;

            objects.push(GameObject {
                position: pos,
                velocity: vel,
                acceleration: acc,
                size,
                friction,
            });
        }

        let palette_hue = rand.gen_range(0.0..360.0);
        let palette = generate_hsv_lum_palette(object_amount, palette_hue, 1.0);
        let anti_palette = generate_hsv_lum_palette(object_amount, (palette_hue + 180.0) % 360.0, 1.0);

        let held_keys = AHashSet::new();

        // let mut render_information = Vec::with_capacity(object_amount);
        // for _ in 0..object_amount {
        //     render_information.push(RenderInformation::default());
        // }

        Self {
            object_amount,
            objects,
            palette,
            anti_palette,
            mouse_position,
            help_menu: true,
            mouse_prevent: false,
            clamping_behavior: true,
            obliterated: false,
            hashnet_size,
            time_dilation,
            held_keys,
            timer: start_time,
            line_offset: 0.0,
            grid_divisor: 50.0,
            grid_spacing_px: 50.0,
            rand,
            canvas_w,
            canvas_h,
            physics_resolution: 4096.0,
            neo_physics_handler: true,
            // render_information,
        }
    }

    pub fn update(&mut self, dt: f64) {
        if self.held_keys.contains("u") {
            if !self.obliterated {
                self.handle_physics(dt);
            }
            self.handle_continuous_keystrokes();
        } else {
            self.handle_continuous_keystrokes();
            if !self.obliterated {
                self.handle_physics(dt);
            }
        }
    }

    fn handle_physics(&mut self, dt: f64) {
        if self.neo_physics_handler {
            self.neo_tick_handler(dt);
        } else {
            self.std_tick_handler(dt);
        }
    }

    fn std_tick_handler(&mut self, dt: f64) {
        self.physics_calc(dt / self.time_dilation);
        if self.clamping_behavior {
            self.border();
        }
    }

    fn neo_tick_handler(&mut self, mut dt: f64) {
        let threshold = 1.0 / self.physics_resolution;
        while dt > threshold {
            self.physics_calc(threshold / self.time_dilation);
            if self.clamping_behavior {
                self.border();
            };
            dt -= threshold;
        }

        self.physics_calc(threshold);
    }

    fn physics_calc(&mut self, dt: f64) {
        for obj in self.objects.iter_mut() {
            let mut tmp1 = obj.position.clone();
            let unit_vec = rsVector2::new(1.0 / self.canvas_w, 1.0 / self.canvas_w);
            // unit_vec.scale(0.25);
            tmp1.one_over_d_sq(self.mouse_position.clone(), &unit_vec);
            tmp1.scale(1000.0);
            obj.acceleration.set_vec(&tmp1);

            obj.velocity.add(obj.acceleration.x * dt, obj.acceleration.y * dt);

            obj.velocity.scale(obj.friction.powf(dt));

            obj.position.add(obj.velocity.x * dt, obj.velocity.y * dt);
        }
    }

    fn border(&mut self) {
        let tl = rsVector2::new(0.0, 0.0);
        let br = rsVector2::new(self.canvas_w, self.canvas_h);

        for obj in self.objects.iter_mut() {
            let x = obj.position.x;
            let y = obj.position.y;

            if x <= tl.x || x >= br.x {
                obj.velocity.x = -obj.velocity.x;
            }

            if y <= tl.y || y >= br.y {
                obj.velocity.y = -obj.velocity.y;
            }

            if x < tl.x {
                obj.position.x = tl.x;
            }

            if x > br.x {
                obj.position.x = br.x;
            }

            if y < tl.y {
                obj.position.y = tl.y;
            }

            if y > br.y {
                obj.position.y = br.y;
            }
        }
    }

    pub fn pressed_key(&mut self, key: String) {
        self.held_keys.insert(key.to_ascii_lowercase());
    }

    pub fn released_key(&mut self, key: String) {
        self.held_keys.remove(&key.to_ascii_lowercase());
    }

    pub fn is_key_pressed(&self, key: String) -> bool {
        self.held_keys.contains(&key.to_ascii_lowercase())
    }

    pub fn update_mouse_position(&mut self, x: f64, y: f64) {
        self.mouse_position.x = x;
        self.mouse_position.y = y;
    }

    pub fn get_test_string(&self) -> String {
        "Hello from Rust!".to_string()
    }

    pub fn update_timer(&mut self, new_timestamp: f64) -> f64 {
        let delta = new_timestamp - self.timer;
        self.timer = new_timestamp;
        delta
    }

    // pub fn update_line_offset(&mut self, dt: f64) {
    //     if !self.obliterated {
    //         self.line_offset = (self.line_offset + 0.5 + dt * 100.0) % self.grid_divisor;
    //     }
    // }

    fn handle_continuous_keystrokes(&mut self) {
        const MOVEMENT_STRENGTH: f64 = 10.0;
        for key in self.held_keys.iter() {
            match key.as_str() {
                "a" => {
                    for obj in self.objects.iter_mut() {
                        let angle = self.rand.gen_range(0.0..(2.0 * PI));
                        let mut tmp1 = obj.position.clone();
                        tmp1.to(&self.mouse_position);

                        let scale = tmp1.mag() * 4.0;

                        let noise_x = angle.cos() * scale;
                        let noise_y = angle.sin() * scale;

                        let mut target_offset = self.mouse_position.clone();
                        target_offset.add(noise_x, noise_y);

                        let mut final_set_vec = obj.position.clone();
                        final_set_vec.to(&target_offset);
                        final_set_vec.scale(3.0);

                        obj.velocity.set_vec(&final_set_vec);
                    }
                }

                "s" => {
                    for obj in self.objects.iter_mut() {
                        obj.velocity.set(0.0, 0.0);
                    }
                }

                "p" => {
                    for obj in self.objects.iter_mut() {
                        let angle = self.rand.gen_range(0.0..(2.0 * PI));
                        let mut tmp1 = rsVector2::new(angle.cos(), angle.sin());
                        tmp1.scale(5000.0);
                        obj.velocity.set_vec(&tmp1);
                    }
                }

                "t" => {
                    for obj in self.objects.iter_mut() {
                        obj.position.add(-MOVEMENT_STRENGTH, 0.0);
                    }
                }

                "y" => {
                    for obj in self.objects.iter_mut() {
                        obj.position.add(MOVEMENT_STRENGTH, 0.0);
                    }
                }

                "g" => {
                    for obj in self.objects.iter_mut() {
                        obj.position.add(0.0, MOVEMENT_STRENGTH);
                    }
                }

                "h" => {
                    for obj in self.objects.iter_mut() {
                        obj.position.add(0.0, -MOVEMENT_STRENGTH);
                    }
                }

                "f" => {
                    for obj in self.objects.iter_mut() {
                        let angle = self.rand.gen_range(0.0..(2.0 * PI));
                        let mut tmp1 = rsVector2::new(angle.cos(), angle.sin());
                        tmp1.scale(MOVEMENT_STRENGTH * 2.0);
                        obj.position.add_vec(&tmp1);
                    }
                }

                "c" => {
                    for obj in self.objects.iter_mut() {
                        obj.position.set_vec(&self.mouse_position);
                    }
                }

                "o" => {
                    for obj in self.objects.iter_mut() {
                        let mut tmp1 = obj.position.clone();
                        tmp1.to(&self.mouse_position);
                        tmp1.rotate(PI / 2.0);
                        tmp1.normalize();
                        tmp1.scale(obj.velocity.mag());
                        obj.velocity.set_vec(&tmp1);
                    }
                }

                "l" => {
                    for obj in self.objects.iter_mut() {
                        let mut tmp1 = obj.position.clone();
                        tmp1.to(&self.mouse_position);
                        tmp1.rotate(-PI / 2.0);
                        tmp1.normalize();
                        tmp1.scale(obj.velocity.mag());
                        obj.velocity.set_vec(&tmp1);
                    }
                }

                "e" => {
                    let mut shift_vector = rsVector2::new(0.0, 0.0);
                    for obj in self.objects.iter_mut() {
                        shift_vector.add_vec(&obj.position);
                    }

                    shift_vector.scale(1.0 / self.object_amount as f64);
                    shift_vector.to(&self.mouse_position);

                    for obj in self.objects.iter_mut() {
                        obj.position.add_vec(&shift_vector);
                    }
                }

                "u" => {
                    const RADIUS: f64 = 200.0;
                    let mut relative_circle_vec = rsVector2::new(0.0, RADIUS);
                    let angle = PI * 2.0 / self.object_amount as f64;

                    for obj in self.objects.iter_mut() {
                        let mut tmp1 = self.mouse_position.clone();
                        tmp1.add_vec(&relative_circle_vec);
                        obj.position.set_vec(&tmp1);

                        let mut tmp2 = relative_circle_vec.clone();
                        tmp2.neg();
                        tmp2.rotate(90.0);
                        tmp2.scale(15.0);
                        obj.velocity.set_vec(&tmp2);

                        relative_circle_vec.rotate(angle);
                    }
                }

                _ => {}
            }
        }
    }

    pub fn handle_tactile_keystroke(&mut self, key: String) {
        match key.as_str() {
            "+" => {
                self.hashnet_size += 3;
                if self.hashnet_size >= self.object_amount {
                    self.hashnet_size = self.object_amount;
                }
            }

            "-" => {
                self.hashnet_size = self.hashnet_size.saturating_sub(3);
            }

            "Tab" => {
                self.help_menu = !self.help_menu;
            }

            "Escape" => {
                self.obliterated = !self.obliterated;
            }

            "x" | "X" => {
                for obj in self.objects.iter_mut() {
                    let remainder = 1.0 - obj.friction;
                    if remainder >= 1.0 || remainder <= 0.0 {
                        obj.friction = 0.5;
                    } else {
                        obj.friction += remainder / 2.0;
                    }
                }
            }

            "q" | "Q" => {
                for obj in self.objects.iter_mut() {
                    obj.friction = 0.5;
                }
            }

            "z" | "Z" => {
                for obj in self.objects.iter_mut() {
                    let remainder = 1.0 - obj.friction;
                    if obj.friction <= 3.0 / 4.0 {
                        obj.friction /= 2.0;
                    } else {
                        obj.friction -= remainder * 2.0;
                    }

                    if obj.friction >= 1.0 || obj.friction <= 0.0 {
                        obj.friction = 0.5;
                    }
                }
            }

            "5" => {
                self.mouse_prevent = !self.mouse_prevent;
            }

            "r" | "R" => {
                self.reset_colors();
            }

            "0" => {
                self.clamping_behavior = !self.clamping_behavior;
            }

            _ => {}
        }
    }

    fn reset_colors(&mut self) {
        let new_palette_hue = self.rand.gen_range(0.0..360.0);
        let new_palette = generate_hsv_lum_palette(self.object_amount, new_palette_hue, 1.0);
        let new_anti_palette = generate_hsv_lum_palette(self.object_amount, (new_palette_hue + 180.0) % 360.0, 1.0);

        self.palette = new_palette;
        self.anti_palette = new_anti_palette;
        self.objects.sort_unstable_by(|obj1, obj2| {
            // distance to mouse
            let mut tmp1 = obj1.position.clone();
            let mut tmp2 = obj2.position.clone();
            tmp1.to(&self.mouse_position);
            tmp2.to(&self.mouse_position);

            match tmp1.mag().partial_cmp(&tmp2.mag()) {
                None => Ordering::Equal,
                Some(ord) => ord,
            }
        });
    }

    pub fn handle_mouse_left_click(&mut self) {
        for obj in self.objects.iter_mut() {
            let mut tmp1 = obj.position.clone();
            tmp1.from(&self.mouse_position);
            let dist = tmp1.mag();

            tmp1.normalize();

            if tmp1.mag() == 0.0 {
                tmp1 = rsVector2::new(1.0, 0.0);
                tmp1.rotate(self.rand.gen_range(0.0..(PI * 2.0)));
            }
            let pow = 1000000.0 / (dist + 100.0) / 2.0;
            tmp1.scale(pow);
            obj.velocity.add_vec(&tmp1);
        }
    }

    pub fn handle_mouse_right_click(&mut self) {
        for obj in self.objects.iter_mut() {
            let mut tmp1 = obj.position.clone();
            tmp1.to(&self.mouse_position);
            let dist = tmp1.mag();

            let mut direction = obj.position.clone();
            direction.to(&self.mouse_position);
            direction.normalize();

            let pow = 5.0 * dist;
            direction.scale(pow);
            obj.velocity.set_vec(&direction);
        }
    }

    // pub fn get_render_information(&self, index: usize) -> RenderInformation {
    //     self.render_information[index].clone()
    // }

    pub fn render(&mut self, f64a: Float64Array) {
        for (i, (obj, color)) in self.objects.iter().zip(self.palette.iter()).enumerate() {
            let [x, y, size_x, size_y] = square_at(obj.position.x, obj.position.y, obj.size.x, obj.size.y);
            let mut trail_vec = obj.velocity.clone();
            trail_vec.normalize();
            let mag = obj.velocity.mag();
            trail_vec.scale(-mag / 1000.0f64.sqrt());

            let line_width = obj.size.mag() / SQRT_2;
            let rgb = color.to_rgb();

            let ri = RenderInformation {
                line_width,
                posx: obj.position.x,
                posy: obj.position.y,
                tvx: trail_vec.x,
                tvy: trail_vec.y,
                sqx: x,
                sqy: y,
                sx: size_x,
                sy: size_y,
                r: rgb.r,
                g: rgb.g,
                b: rgb.b,
            };

            let index = (i * 12) as u32;
            f64a.set_index(index, ri.line_width);
            f64a.set_index(index + 1, ri.posx);
            f64a.set_index(index + 2, ri.posy);
            f64a.set_index(index + 3, ri.tvx);
            f64a.set_index(index + 4, ri.tvy);
            f64a.set_index(index + 5, ri.sqx);
            f64a.set_index(index + 6, ri.sqy);
            f64a.set_index(index + 7, ri.sx);
            f64a.set_index(index + 8, ri.sy);
            f64a.set_index(index + 9, ri.r);
            f64a.set_index(index + 10, ri.g);
            f64a.set_index(index + 11, ri.b);
        }
    }

    pub fn increase_time_dilation(&mut self) {
        self.time_dilation *= (3.0f64).powf(0.5);
        if self.time_dilation > 2187.0 {
            self.time_dilation = 2187.0;
        };
    }

    pub fn decrease_time_dilation(&mut self) {
        self.time_dilation /= (3.0f64).powf(0.5);
        if self.time_dilation < 1.0 {
            self.time_dilation = 1.0;
        };
    }

    pub fn set_mouse(&mut self, x: f64, y: f64) {
        self.mouse_position.x = x;
        self.mouse_position.y = y;
    }
}

#[wasm_bindgen]
#[derive(Default, Clone, Debug)]
pub struct RenderInformation {
    pub line_width: f64,
    pub posx: f64,
    pub posy: f64,
    pub tvx: f64,
    pub tvy: f64,
    pub sqx: f64,
    pub sqy: f64,
    pub sx: f64,
    pub sy: f64,
    pub r: f64,
    pub g: f64,
    pub b: f64,
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}
