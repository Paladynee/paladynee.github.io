/// Performs a 32-bit XOR shift operation to produce a pseudo-random bit sequence.
///
/// Returns the resulting 32-bit unsigned integer.
pub const fn xor_shift(mut x: u32) -> u32 {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    x
}
