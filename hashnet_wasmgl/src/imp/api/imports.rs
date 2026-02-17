unsafe extern "C" {
    /// Appends the specified bytes to the current panic message buffer in JavaScript.
    pub unsafe fn js_panic_write_bytes(ptr: *const u8, len: usize);
    /// Finalizes and displays the current panic message in JavaScript, typically via `alert`.
    pub safe fn js_panic_flush();
    /// Prints an integer value to the JavaScript console for debugging.
    pub safe fn js_print_int(int: i32);
}
