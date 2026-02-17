import { make_i32_view, make_f32_view, INDICES, CONSTANTS } from "./shared_comm_buf.js";

function key_to_idx(key) {
    if (key.length === 1) {
        return key.toLowerCase().charCodeAt(0);
    }
    const mapping = {
        Enter: 13,
        Escape: 27,
        Esc: 27,
        Space: 32,
        " ": 32,
        ArrowLeft: 37,
        ArrowUp: 38,
        ArrowRight: 39,
        ArrowDown: 40,
        Shift: 16,
        Control: 17,
        Alt: 18,
        Tab: 9,
    };
    return mapping[key] || -1;
}

function shared_comm_buf_controller(i32, f32) {
    const SQRT_3 = Math.sqrt(3);
    const TD_MAX = 2187.0;
    const TD_MIN = 1.0;

    return {
        tactile_push(code) {
            const head = Atomics.load(i32, INDICES.TACTILE_HEAD);
            const next_head = (head + 1) % 16;
            if (next_head !== Atomics.load(i32, INDICES.TACTILE_TAIL)) {
                i32[INDICES.TACTILE_QUEUE_START + head] = code;
                Atomics.store(i32, INDICES.TACTILE_HEAD, next_head);
            }
        },
        update_mouse_pos(x, y) {
            f32[INDICES.MOUSE_X] = x;
            f32[INDICES.MOUSE_Y] = y;
        },
        update_mouse_button(button, is_down) {
            if (is_down) {
                Atomics.or(i32, INDICES.MOUSE_BUTTONS, 1 << button);
            } else {
                Atomics.and(i32, INDICES.MOUSE_BUTTONS, ~(1 << button));
            }
        },
        update_canvas_size(w, h) {
            f32[INDICES.CANVAS_W] = w;
            f32[INDICES.CANVAS_H] = h;
        },
        update_key(idx, is_down) {
            const word_idx = INDICES.KEYS + (idx >> 5);
            const bit = 1 << (idx & 31);
            if (is_down) {
                Atomics.or(i32, word_idx, bit);
            } else {
                Atomics.and(i32, word_idx, ~bit);
            }
        },
        increase_time_dilation() {
            f32[INDICES.TIME_DILATION] *= SQRT_3;
            if (f32[INDICES.TIME_DILATION] > TD_MAX) f32[INDICES.TIME_DILATION] = TD_MAX;
        },
        decrease_time_dilation() {
            f32[INDICES.TIME_DILATION] /= SQRT_3;
            if (f32[INDICES.TIME_DILATION] < TD_MIN) f32[INDICES.TIME_DILATION] = TD_MIN;
        },
        reset_palette() {
            Atomics.or(i32, INDICES.FLAG_B, CONSTANTS.FLAG_RESET_PALETTE);
        },
    };
}

/// Registers browser window event listeners and updates the shared input buffer.
///
/// Handles mouse movement, window resizing, keyboard input, and scroll wheel scaling.
export function register_events(shared_comm_buf) {
    const f32 = make_f32_view(shared_comm_buf);
    const i32 = make_i32_view(shared_comm_buf);
    const controller = shared_comm_buf_controller(i32, f32);

    window.addEventListener("contextmenu", (e) => e.preventDefault());

    window.addEventListener("mousemove", (e) => {
        controller.update_mouse_pos(e.clientX, e.clientY);
    });

    window.addEventListener("mousedown", (e) => {
        controller.update_mouse_button(e.button, true);

        if (e.button === 0) controller.tactile_push(CONSTANTS.TACTILE_MOUSE_LEFT_DOWN);
        else if (e.button === 2)
            controller.tactile_push(CONSTANTS.TACTILE_MOUSE_RIGHT_DOWN);
    });

    window.addEventListener("mouseup", (e) => {
        controller.update_mouse_button(e.button, false);
    });

    window.addEventListener("resize", () => {
        controller.update_canvas_size(window.innerWidth, window.innerHeight);
    });

    const info = document.getElementById("info");
    window.addEventListener("keydown", (e) => {
        const idx = key_to_idx(e.key);
        if (idx >= 0 && idx < 128) {
            controller.update_key(idx, true);
            controller.tactile_push(idx);
        }

        if (e.key === "Tab") {
            const is_visible = getComputedStyle(info).display !== "none";
            info.style.display = is_visible ? "none" : "block";
        }

        const prevent_keys = [
            "+",
            "-",
            "Tab",
            "Escape",
            "Esc",
            "z",
            "Z",
            "q",
            "Q",
            "x",
            "X",
            "r",
            "R",
            "0",
            "5",
        ];
        if (prevent_keys.includes(e.key)) e.preventDefault();
    });

    window.addEventListener("keyup", (e) => {
        const idx = key_to_idx(e.key);
        if (idx >= 0 && idx < 128) {
            controller.update_key(idx, false);
        }
    });

    window.addEventListener("wheel", (e) => {
        if (e.deltaY > 0) {
            controller.increase_time_dilation();
        } else {
            controller.decrease_time_dilation();
        }
    });
}
