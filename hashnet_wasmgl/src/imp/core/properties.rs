use core::alloc::Layout;
use core::mem;

/// Compile-time properties for sized types, including layout and alignment.
pub trait SizedTypeProperties: Sized {
    /// The size of the type in bytes.
    const SIZE: usize = mem::size_of::<Self>();
    /// The memory alignment of the type.
    const ALIGN: usize = mem::align_of::<Self>();
    /// The memory layout of the type.
    const LAYOUT: Layout = Layout::new::<Self>();
    /// True if the type is a zero-sized type (ZST).
    const IS_ZST: bool = Self::SIZE == 0;
}

impl<T> SizedTypeProperties for T {}
