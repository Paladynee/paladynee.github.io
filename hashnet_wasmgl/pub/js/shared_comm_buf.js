//! zero-copy communication between main thread and workers.
//! there is no postMessage after init.
//!
//! Layout:
//!     0, mouse_x: f32,
//!     1, mouse_y: f32,
//!     2, canvas_w: f32,
//!     3, canvas_h: f32,
//!     4, time_dilation: f32,
//!     5, flag_a: i32, (reserved)
//!     6, flag_b: i32, (reserved)
//!     7, flag_c: i32, (reserved)
//!     8, flag_d: i32, (reserved)
//!     9, mouse_buttons: i32,
//!     10, keys: [i32; 4],
//!     14, tactile_head: i32,
//!     15, tactile_tail: i32,
//!     16, tactile_queue: [i32; 16],

/// The total size in bytes for the shared communication buffer.
export const SHARED_COMM_BUF_SIZE = 256;

export const INDICES = {
    /// Index position for the mouse X coordinate
    MOUSE_X: 0,
    /// Index position for the mouse Y coordinate
    MOUSE_Y: 1,
    /// Index position for the canvas width
    CANVAS_W: 2,
    /// Index position for the canvas height
    CANVAS_H: 3,
    /// Index position for the simulation time dilation factor
    TIME_DILATION: 4,
    /// Index position for reserved flag bit A.
    FLAG_A: 5,
    /// Index position for reserved flag bit B.
    FLAG_B: 6,
    /// Index position for reserved flag bit C.
    FLAG_C: 7,
    /// Index position for reserved flag bit D.
    FLAG_D: 8,
    /// Monotonic physics tick counter written by logic worker and sampled by render worker
    /// Occupies flag A.
    LOGIC_TICK: 5,
    /// Index position for the mouse button bitmask
    MOUSE_BUTTONS: 9,
    /// Index for the 128-bit keyboard state bitmask
    KEYS: 10,
    /// Index for the tactile event queue head (write pointer)
    TACTILE_HEAD: 14,
    /// Index for the tactile event queue tail (read pointer)
    TACTILE_TAIL: 15,
    /// Starting index for the 16-slot tactile event queue
    TACTILE_QUEUE_START: 16,
};

export const CONSTANTS = {
    /// Tactile event code for left mouse down
    TACTILE_MOUSE_LEFT_DOWN: 250,
    /// Tactile event code for right mouse down
    TACTILE_MOUSE_RIGHT_DOWN: 251,
    /// Flag bit indicating a request to reset the particle color palette
    FLAG_RESET_PALETTE: 1,
    /// Opcode for initiating worker setup
    OP_INIT: 0,
    /// Opcode indicating that a worker has completed its setup phase
    OP_READY: 1,
};

/// Creates a 32-bit float view over a SharedArrayBuffer for coordinate and factor data
export function f32_view(sab) {
    return new Float32Array(sab);
}

/// Creates a 32-bit signed integer view over a SharedArrayBuffer for atomic flags and state
export function i32_view(sab) {
    return new Int32Array(sab);
}

export const make_f32_view = f32_view;
export const make_i32_view = i32_view;
