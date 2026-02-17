use core::alloc::GlobalAlloc;
use core::alloc::Layout;
use core::ptr;

/// Custom global allocator using `dlmalloc` for WebAssembly.
struct MyAlloc;

static mut DLMALLOC: dlmalloc::Dlmalloc = dlmalloc::Dlmalloc::new();

unsafe impl GlobalAlloc for MyAlloc {
    /// Allocates memory as described by the given layout.
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        unsafe { (*ptr::addr_of_mut!(DLMALLOC)).malloc(layout.size(), layout.align()) }
    }

    /// Deallocates the block of memory at the given pointer.
    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        unsafe { (*ptr::addr_of_mut!(DLMALLOC)).free(ptr, layout.size(), layout.align()) }
    }

    /// Behaves like `alloc`, but also ensures that the contents are set to zero.
    unsafe fn alloc_zeroed(&self, layout: Layout) -> *mut u8 {
        unsafe { (*ptr::addr_of_mut!(DLMALLOC)).calloc(layout.size(), layout.align()) }
    }

    /// Shrinks or expands the existing block of memory to the given new size.
    unsafe fn realloc(&self, ptr: *mut u8, layout: Layout, new_size: usize) -> *mut u8 {
        unsafe { (*ptr::addr_of_mut!(DLMALLOC)).realloc(ptr, layout.size(), layout.align(), new_size) }
    }
}

/// The global allocator instance.
#[global_allocator]
static GLOBAL: MyAlloc = MyAlloc;
