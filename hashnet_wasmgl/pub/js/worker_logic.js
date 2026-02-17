import { get_wasm } from "./get_wasm.js";
import { printf } from "./printf.js";
import { INDICES, CONSTANTS, make_f32_view, make_i32_view } from "./shared_comm_buf.js";

function shared_comm_buf_controller(i32, f32, wasm) {
    return {
        update_wasm_inputs() {
            wasm.update_mouse_pos(f32[INDICES.MOUSE_X], f32[INDICES.MOUSE_Y]);
            wasm.update_mouse_buttons(i32[INDICES.MOUSE_BUTTONS]);
            wasm.update_keys(
                i32[INDICES.KEYS + 0],
                i32[INDICES.KEYS + 1],
                i32[INDICES.KEYS + 2],
                i32[INDICES.KEYS + 3],
            );
        },
        process_tactile_queue() {
            let tail = Atomics.load(i32, INDICES.TACTILE_TAIL);
            const head = Atomics.load(i32, INDICES.TACTILE_HEAD);
            while (tail !== head) {
                const code = i32[INDICES.TACTILE_QUEUE_START + tail];
                wasm.tactile_keyboard_event(code);
                tail = (tail + 1) % 16;
                Atomics.store(i32, INDICES.TACTILE_TAIL, tail);
            }
        },
        process_flags() {
            const flags = Atomics.exchange(i32, INDICES.FLAG_B, 0);
            if (flags & CONSTANTS.FLAG_RESET_PALETTE) wasm.reset_palette();
        },
        read_canvas_size() {
            return { w: f32[INDICES.CANVAS_W], h: f32[INDICES.CANVAS_H] };
        },
        read_time_dilation() {
            return f32[INDICES.TIME_DILATION];
        },
    };
}

/// The primary message handler for the logic worker, initializing simulation state and starting the physics loop.
///
/// Listens for a one-time initialization message, then enters an infinite loop for synchronous physics updates.
self.onmessage = async (e) => {
    printf("[logic] received message");
    if (e.data.op !== CONSTANTS.OP_INIT) return;
    printf("[logic] message was OP_INIT");
    const { memory, shared_comm_buf, width, height } = e.data.payload;
    printf("[logic] payload correct");
    printf(
        "\tmemory = %s",
        memory instanceof WebAssembly.Memory ? "WebAssembly.Memory" : "invalid",
    );
    printf(
        "\tshared_comm_buf = %s",
        shared_comm_buf instanceof SharedArrayBuffer ? "SharedArrayBuffer" : "invalid",
    );
    printf("\twidth = %d", width);
    printf("\theight = %d", height);

    const wasm = await get_wasm(memory, width, height);
    printf("[logic] gotten wasm");

    const [xs, ys, vxs, vys] = wasm.get_draw_pointers();
    const [crs, cgs, cbs] = wasm.get_color_pointers();
    const len = wasm.get_amount_objects();
    const payload = {
        xs,
        ys,
        vxs,
        vys,
        crs,
        cgs,
        cbs,
        len,
    };
    printf("[logic] prepared pointers for main thread");

    self.postMessage({
        op: CONSTANTS.OP_READY,
        payload,
    });
    printf("[logic] sent OP_READY message");

    // all input arrives through shared memory from here on
    self.onmessage = null;

    let last_w = width;
    let last_h = height;
    let last_t = performance.now();

    const i32 = make_i32_view(shared_comm_buf);
    const f32 = make_f32_view(shared_comm_buf);
    const controller = shared_comm_buf_controller(i32, f32, wasm);
    printf("[logic] made shared communication controller");

    const scheduler = new MessageChannel();

    function tick() {
        const now = performance.now();
        const dt = (now - last_t) / 1000;

        // skip updates if no time has passed
        if (dt <= 0) {
            scheduler.port2.postMessage(0);
            return;
        }

        last_t = now;

        controller.update_wasm_inputs();
        controller.process_tactile_queue();
        controller.process_flags();

        const { w, h } = controller.read_canvas_size();
        if (w !== last_w || h !== last_h) {
            last_w = w;
            last_h = h;
            wasm.update_canvas_size(w, h);
        }

        wasm.handle_continuous_controls();

        const time_dilation = controller.read_time_dilation();
        wasm.update_physics(dt / time_dilation);

        // yield to the event loop to prevent UI starvation and handle IPC
        scheduler.port2.postMessage(0);
    }

    scheduler.port1.onmessage = tick;
    scheduler.port2.postMessage(0);
    printf("[logic] started logic loop");

    printf("[logic] done");
};
