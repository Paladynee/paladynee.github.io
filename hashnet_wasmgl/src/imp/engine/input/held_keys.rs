/// An iterator over the currently held keys in the bitmask.
pub struct HeldKeysIterator {
    pub keys: [u32; 4],
    pub current_idx: usize,
    pub current_bit: u32,
}

impl Iterator for HeldKeysIterator {
    type Item = u8;

    fn next(&mut self) -> Option<Self::Item> {
        while self.current_idx < 4 {
            let mask = unsafe { *self.keys.get_unchecked(self.current_idx) };
            if mask == 0 {
                self.current_idx += 1;
                self.current_bit = 0;
                continue;
            }
            while self.current_bit < 32 {
                let bit = 1 << self.current_bit;
                if (mask & bit) != 0 {
                    let code = (self.current_idx as u32 * 32) + self.current_bit;
                    self.current_bit += 1;
                    return Some(code as u8);
                }
                self.current_bit += 1;
            }
            self.current_idx += 1;
            self.current_bit = 0;
        }
        None
    }
}