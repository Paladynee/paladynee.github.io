use core::arch::wasm32::f32_sqrt;
use core::f32;
use core::intrinsics::cosf32;
use core::intrinsics::fmaf32;
use core::intrinsics::sinf32;

/// A 2D vector with 32-bit floating point components.
#[derive(Clone, Copy)]
#[repr(C)]
pub struct Vec2f {
    /// The horizontal coordinate.
    pub x: f32,
    /// The vertical coordinate.
    pub y: f32,
}

impl Vec2f {
    /// Creates a new vector with the specified coordinates.
    pub const fn new(x: f32, y: f32) -> Vec2f {
        Vec2f { x, y }
    }

    /// Returns the horizontal coordinate of the vector.
    pub const fn get_x(&self) -> f32 {
        self.x
    }

    /// Returns the vertical coordinate of the vector.
    pub const fn get_y(&self) -> f32 {
        self.y
    }

    /// Sets both coordinates of the vector to match another vector.
    pub const fn set_vec(&mut self, other: &Vec2f) {
        self.x = other.x;
        self.y = other.y;
    }

    /// Sets both coordinates of the vector to the specified values.
    pub const fn set(&mut self, x: f32, y: f32) {
        self.x = x;
        self.y = y;
    }

    /// Adds the components of another vector to this vector's components.
    pub const fn add_vec(&mut self, other: &Vec2f) {
        self.x += other.x;
        self.y += other.y;
    }

    /// Adds the specified values to this vector's components.
    pub const fn add(&mut self, x: f32, y: f32) {
        self.x += x;
        self.y += y;
    }

    /// Multiplies both components of the vector by a scalar factor.
    pub const fn scale(&mut self, factor: f32) {
        self.x *= factor;
        self.y *= factor;
    }

    /// Multiplies this vector's components element-wise by another vector's components.
    pub const fn scale_vec(&mut self, other: &Vec2f) {
        self.x *= other.x;
        self.y *= other.y;
    }

    /// Rescales the vector to have a magnitude of 1.0, or zero if it was already zero.
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

    /// Returns the squared magnitude (length) of the vector.
    pub const fn mag_sq(&self) -> f32 {
        self.x * self.x + self.y * self.y
    }

    /// Returns the magnitude (length) of the vector.
    pub fn mag(&self) -> f32 {
        f32_sqrt(self.mag_sq())
    }

    /// Currently performs a normalization followed by a scaling, effectively doing nothing different than scaling by its current magnitude if already normalized, or essentially just being an identity operation if implemented this way.
    pub fn square(&mut self) {
        let mag = self.mag();
        self.normalize();
        self.scale(mag);
    }

    /// Subtracts the current vector's components from another vector's components and stores the result in this vector.
    pub const fn to(&mut self, other: &Vec2f) {
        self.x = other.x - self.x;
        self.y = other.y - self.y;
    }

    /// Subtracts another vector's components from this vector's components.
    pub const fn from(&mut self, other: &Vec2f) {
        self.x -= other.x;
        self.y -= other.y;
    }

    /// Reverses the direction of the vector by negating both components.
    pub const fn neg(&mut self) {
        self.x = -self.x;
        self.y = -self.y;
    }

    /// Calculates an inverse-distance-weighted force vector towards a target.
    pub fn one_over_d_sq(&mut self, mut consume_target: Vec2f, unit_size: &Vec2f) {
        self.scale_vec(unit_size);
        consume_target.scale_vec(unit_size);
        self.to(&consume_target);

        let mag = self.mag();
        let mag = 1.0 / (fmaf32(mag, mag, 0.1));
        self.normalize();
        self.scale(mag);
    }

    /// Rotates the vector by the specified angle in radians.
    pub fn rotate(&mut self, angle: f32) {
        let sin = sinf32(angle);
        let cos = cosf32(angle);

        let new_x = self.x * cos - self.y * sin;
        let new_y = self.x * sin + self.y * cos;

        self.x = new_x;
        self.y = new_y;
    }
}
