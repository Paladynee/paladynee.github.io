/** @type {HTMLCanvasElement} */
const can = document.querySelector("canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = can.getContext("2d");
resize(can);

let state = GameState.new(3000, can.width, can.height, rsVector2.new(can.width / 2, can.height / 2), 18, 3, performance.now());
state.neo_physics_handler = true;
globalThis.state = state;

window.addEventListener("resize", () => {
    resize(can, state);
});

window.addEventListener("mousemove", (e) => {
    if (!state.mouse_prevent) {
        state.set_mouse(e.clientX, e.clientY);
    }
});

window.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
        state.handle_mouse_left_click();
    } else {
        state.handle_mouse_right_click();
    }
});

window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

window.addEventListener("keydown", (e) => {
    state.pressed_key(e.key);
    state.handle_tactile_keystroke(e.key);
    let prevent_keys = ["+", "-", "Tab", "Escape", "z", "Z", "q", "Q", "x", "X", "r", "R", "0", "5"];
    if (prevent_keys.includes(e.key)) e.preventDefault();
});

window.addEventListener("keyup", (e) => {
    e.preventDefault();
    state.released_key(e.key);
});

window.addEventListener("wheel", (e) => {
    if (e.deltaY > 0) {
        state.increase_time_dilation();
    } else {
        state.decrease_time_dilation();
    }
});

globalThis.render_array = new Float64Array(state.object_amount * 12);
draw(state, can, ctx);
