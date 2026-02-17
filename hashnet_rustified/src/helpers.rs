#[allow(unused)]
use log::{error, info};

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Hsv {
    pub h: f64,
    pub s: f64,
    pub v: f64,
}

#[wasm_bindgen]
pub struct Rgb {
    pub r: f64,
    pub g: f64,
    pub b: f64,
}

pub fn generate_hsv_lum_palette(size: usize, hue: f64, saturation: f64) -> Vec<Hsv> {
    let step_size = 1.0 / size as f64;
    let mut palette = Vec::with_capacity(size);

    (0..size)
        .map(|i| {
            let luminosity = (i as f64).mul_add(-step_size, 1.0);
            Hsv {
                h: hue,
                s: saturation,
                v: luminosity,
            }
        })
        .for_each(|s| palette.push(s));

    palette
}

#[wasm_bindgen]
impl Hsv {
    pub fn rot_hue(&self, degrees: f64) -> Hsv {
        let mut new_hue = (self.h + degrees) % 360.0;
        if !(0.0..360.0).contains(&new_hue) {
            #[cold]
            #[inline(always)]
            fn _cold() {}
            _cold();
            let next = new_hue % 360.0;
            if next < 0.0 {
                new_hue = 360.0 + next;
            } else {
                new_hue = next;
            }
        }
        Hsv {
            h: new_hue,
            s: self.s,
            v: self.v,
        }
    }

    pub fn to_rgb(&self) -> Rgb {
        let h = self.h;
        let s = self.s;
        let v = self.v;

        let c = v * s;
        let x = c * (1.0 - ((h / 60.0) % 2.0 - 1.0).abs());
        let m = v - c;

        let r;
        let g;
        let b;

        // if (0.0..60.0).contains(&h) {
        //     r = c;
        //     g = x;
        //     b = 0.0;
        // } else if (60.0..120.0).contains(&h) {
        //     r = x;
        //     g = c;
        //     b = 0.0;
        // } else if (120.0..180.0).contains(&h) {
        //     r = 0.0;
        //     g = c;
        //     b = x;
        // } else if (180.0..240.0).contains(&h) {
        //     r = 0.0;
        //     g = x;
        //     b = c;
        // } else if (240.0..300.0).contains(&h) {
        //     r = x;
        //     g = 0.0;
        //     b = c;
        // } else {
        //     r = c;
        //     g = 0.0;
        //     b = x;
        // }
        match h {
            0.0..60.0 => {
                r = c;
                g = x;
                b = 0.0;
            }
            60.0..120.0 => {
                r = x;
                g = c;
                b = 0.0;
            }
            120.0..180.0 => {
                r = 0.0;
                g = c;
                b = x;
            }
            180.0..240.0 => {
                r = 0.0;
                g = x;
                b = c;
            }
            240.0..300.0 => {
                r = x;
                g = 0.0;
                b = c;
            }
            300.0..360.0 | 360.0 => {
                r = c;
                g = 0.0;
                b = x;
            }
            _ => {
                r = c;
                g = 0.0;
                b = x;
            }
        }

        Rgb {
            r: ((r + m) * 255.0).round(),
            g: ((g + m) * 255.0).round(),
            b: ((b + m) * 255.0).round(),
        }
    }
}

// pub fn rgb_to_hsv(rgb: Rgb) -> Hsv {
//     r /= 255.0;
//     g /= 255.0;
//     b /= 255.0;

//     let max = r.max(g).max(b);
//     let min = r.min(g).min(b);

//     let mut h;

//     let delta = max - min;

//     if delta == 0.0 {
//         h = 0.0
//     } else if max == r {
//         h = ((g - b) / delta) % 6.0;
//     } else if max == g {
//         h = (b - r) / delta + 2.0;
//     } else {
//         h = (r - g) / delta + 4.0;
//     }

//     h = (h * 60.0 + 360.0) % 360.0;
//     let s = if max == 0.0 { 0.0 } else { delta / max };
//     let v = max;
//     (h, s, v)
// }

pub const fn square_at(pos_x: f64, pos_y: f64, size_x: f64, size_y: f64) -> [f64; 4] {
    [pos_x - size_x / 2.0, pos_y - size_y / 2.0, size_x, size_y]
}
