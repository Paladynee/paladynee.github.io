use core::hash::Hash;
use core::hash::Hasher;

/// A wrapper for f32 that implements Hash by using its bit representation.
pub struct Hf(pub f32);
/// A wrapper for f64 that implements Hash by using its bit representation.
pub struct Hd(pub f64);

impl Hash for Hf {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.0.to_bits().hash(state);
    }
}

impl Hash for Hd {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.0.to_bits().hash(state);
    }
}
