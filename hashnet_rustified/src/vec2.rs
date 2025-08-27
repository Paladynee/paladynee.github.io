use std::f64::consts::PI;

use rand::Rng;
use wasm_bindgen::prelude::*;
#[wasm_bindgen]
#[allow(non_camel_case_types)]
#[derive(Clone, Debug)]
pub struct rsVector2 {
    pub x: f64,
    pub y: f64,
}

#[wasm_bindgen]
impl rsVector2 {
    pub fn new(x: f64, y: f64) -> rsVector2 {
        rsVector2 { x, y }
    }

    pub fn make_clone(&self) -> rsVector2 {
        self.clone()
    }

    pub fn get_x(&self) -> f64 {
        self.x
    }

    pub fn get_y(&self) -> f64 {
        self.y
    }

    pub fn set_vec(&mut self, other: &rsVector2) {
        self.x = other.x;
        self.y = other.y;
    }

    pub fn set(&mut self, x: f64, y: f64) {
        self.x = x;
        self.y = y;
    }

    pub fn add_vec(&mut self, other: &rsVector2) {
        self.x += other.x;
        self.y += other.y;
    }

    pub fn add(&mut self, x: f64, y: f64) {
        self.x += x;
        self.y += y;
    }
    pub fn scale(&mut self, factor: f64) {
        self.x *= factor;
        self.y *= factor;
    }

    pub fn scale_vec(&mut self, other: &rsVector2) {
        self.x *= other.x;
        self.y *= other.y;
    }

    pub fn normalize(&mut self) {
        let hypot = self.mag();
        if hypot == 0.0 {
            self.x = 0.0;
            self.y = 0.0;
            return;
        }
        self.x /= hypot;
        self.y /= hypot;
    }

    pub fn mag(&self) -> f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }

    pub fn square(&mut self) {
        let mag = self.mag();
        self.normalize();
        self.scale(mag);
    }

    pub fn to(&mut self, other: &rsVector2) {
        self.x = other.x - self.x;
        self.y = other.y - self.y;
    }

    pub fn from(&mut self, other: &rsVector2) {
        self.x -= other.x;
        self.y -= other.y;
    }

    pub fn neg(&mut self) {
        self.x = -self.x;
        self.y = -self.y;
    }

    pub fn one_over_d_sq(&mut self, consume_target: rsVector2, unit_size: &rsVector2) {
        self.scale_vec(unit_size);
        let mut tmp = consume_target;
        tmp.scale_vec(unit_size);
        self.to(&tmp);

        let mag = 1.0 / (self.mag().powi(2) + 0.1);
        self.normalize();
        self.scale(mag);
    }

    pub fn divide(&self, amount: f64) -> Vec<rsVector2> {
        let mut vec_tuple_array = Vec::new();
        let mut unit = self.clone();
        unit.normalize();
        let mag = self.mag();
        unit.scale(mag);

        for i in 0..amount as i32 {
            let mut start = unit.clone();
            start.scale(i as f64);

            let mut end = start.clone();
            end.add_vec(&unit);

            vec_tuple_array.push(start);
            vec_tuple_array.push(end);
        }

        vec_tuple_array
    }

    pub fn divide_rand(&self, amount: f64, randomization_factor: f64) -> Vec<rsVector2> {
        let mut rand = rand::thread_rng();
        let mut vec_tuple_array: Vec<rsVector2> = Vec::new();

        let mut direction = self.clone();
        direction.normalize();

        let mag = self.mag();
        let mut unit = direction.clone();
        unit.scale(mag / amount);

        for i in 0..amount as i32 {
            let actual_start = if i == 0 {
                rsVector2::new(0.0, 0.0)
            } else {
                let mut x = unit.clone();
                x.scale(i as f64);
                x
            };

            let mut actual_end = actual_start.clone();
            actual_end.add_vec(&unit);

            let rand_start = if i == 0 {
                actual_start.clone()
            } else {
                vec_tuple_array[(i as usize - 1) * 4 + 3].clone()
            };

            let rand_end = if i == amount as i32 - 1 {
                actual_end.clone()
            } else {
                let mut tmp1 = direction.clone();
                tmp1.rotate(PI / 2.0);
                tmp1.scale(rand.gen_range(-1.0..1.0) * randomization_factor);
                let mut ret = actual_end.clone();
                ret.add_vec(&tmp1);
                ret
            };

            vec_tuple_array.push(actual_start);
            vec_tuple_array.push(actual_end);
            vec_tuple_array.push(rand_start);
            vec_tuple_array.push(rand_end);
        }

        vec_tuple_array
    }

    pub fn rotate(&mut self, angle: f64) {
        let cos = angle.cos();
        let sin = angle.sin();

        let new_x = self.x * cos - self.y * sin;
        let new_y = self.x * sin + self.y * cos;

        self.x = new_x;
        self.y = new_y;
    }

    pub fn arr(&self) -> Vec<f64> {
        Vec::from([self.x, self.y])
    }
}
