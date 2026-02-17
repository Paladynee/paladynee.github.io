use crate::exports::js_panic_flush;
use crate::exports::js_panic_write_bytes;
use crate::exports::js_print_int;
use core::arch::wasm32;
use core::fmt;
use core::fmt::Write;
use core::panic;

/// The custom panic handler that redirects panic messages to the JavaScript side.
#[panic_handler]
fn panic(info: &panic::PanicInfo) -> ! {
    js_print_int(666);
    let message = info.message();
    let location = info.location();

    let mut f = JsPanicFormatter(());
    let _ = write!(f, "Panic: {}", message);
    if let Some(location) = location {
        let _ = write!(f, " at {}:{}", location.file(), location.line());
    }
    js_panic_flush();
    wasm32::unreachable();
}

/// Internal formatter that writes panic messages to JavaScript via `js_panic_write_bytes`.
struct JsPanicFormatter(());

impl Drop for JsPanicFormatter {
    fn drop(&mut self) {
        js_panic_flush();
    }
}

impl fmt::Write for JsPanicFormatter {
    fn write_str(&mut self, s: &str) -> fmt::Result {
        unsafe {
            js_panic_write_bytes(s.as_ptr(), s.len());
        }
        Ok(())
    }
}
