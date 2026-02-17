import { eprintf, printf } from "./printf.js";

/// Decodes a string from WebAssembly linear memory.
///
/// Copies bytes from the specified pointer and length to a temporary buffer before decoding.
export function read_string(memory, ptr, len) {
    const bytes = new Uint8Array(memory.buffer, ptr, len);
    // for some reason TextDecoder does not support SharedArrayBuffer
    // so we have to copy here
    const copy = new Uint8Array(len);
    copy.set(bytes);
    return new TextDecoder().decode(copy);
}

/// Fetches, instantiates, and initializes the WebAssembly module.
///
/// Sets up the import object with environment functions for panic handling and debugging.
/// Returns a high-level API object wrapping the exported Wasm functions.
export async function get_wasm(memory, width, height) {
    let panic_message_buffer = "";
    const importObject = {
        env: {
            memory,
            js_panic_write_bytes(ptr, len) {
                const msg = read_string(memory, ptr, len);
                panic_message_buffer += msg;
            },
            js_panic_flush() {
                eprintf("[wasm] panic: %s", panic_message_buffer);
                console.error(new Error().stack);
                panic_message_buffer = "";
            },
            js_print_int(int) {
                printf("[wasm] js_print_int: %d", int);
            },
        },
    };

    const wasmUrl = new URL("../hashnet_wasmgl.wasm", import.meta.url);
    const { instance } = await WebAssembly.instantiateStreaming(
        fetch(wasmUrl),
        importObject,
    );
    const e = instance.exports;

    e.init_lib(width, height, Math.random(), Math.random());

    return {
        get_mouse_pos() {
            const ptr = e.get_mouse_pos();
            return new Float32Array(memory.buffer, ptr, 2);
        },
        update_mouse_pos(x, y) {
            e.update_mouse_pos(x, y);
        },
        get_draw_pointers() {
            const ptr = e.get_draw_pointers();
            return new Uint32Array(memory.buffer, ptr, 4);
        },
        get_color_pointers() {
            const ptr = e.get_color_pointers();
            return new Uint32Array(memory.buffer, ptr, 3);
        },
        get_amount_objects() {
            return e.get_amount_objects();
        },
        update_physics(dt) {
            e.update_physics(dt);
        },
        update_canvas_size(width, height) {
            e.update_canvas_size(width, height);
        },
        reset_palette() {
            e.reset_palette();
        },
        update_keys(k0, k1, k2, k3) {
            e.update_keys(k0, k1, k2, k3);
        },
        update_mouse_buttons(mask) {
            e.update_mouse_buttons(mask);
        },
        handle_continuous_controls() {
            e.handle_continuous_controls();
        },
        tactile_keyboard_event(code) {
            e.tactile_keyboard_event(code);
        },
    };
}
