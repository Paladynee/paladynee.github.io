import {
    SHARED_COMM_BUF_SIZE,
    INDICES,
    CONSTANTS,
    make_f32_view,
    make_i32_view,
} from "./shared_comm_buf.js";
import { register_events } from "./events.js";
import { printf } from "./printf.js";
import { init_webgl, draw_webgl } from "./webgl.js";

try {
    main().catch(console.error);
} catch (e) {
    console.error(e);
}

/// The entry point for the browser application, setting up high-level resources and workers.
async function main() {
    const canvas = document.getElementById("canvas");
    if (!canvas) throw new Error("No canvas");
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Not a canvas element");
    printf("[main] canvas found");

    const memory = new WebAssembly.Memory({
        initial: 4096,
        maximum: 32768,
        shared: true,
    });
    printf("[main] wasm memory gotten");

    const shared_comm_buf = new SharedArrayBuffer(SHARED_COMM_BUF_SIZE);
    globalThis.shared_comm_buf = shared_comm_buf;
    printf("[main] shared array buffer initialized with %d bytes", SHARED_COMM_BUF_SIZE);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const f32 = make_f32_view(shared_comm_buf);
    f32[INDICES.MOUSE_X] = canvas.width / 2;
    f32[INDICES.MOUSE_Y] = canvas.height / 2;
    f32[INDICES.CANVAS_W] = canvas.width;
    f32[INDICES.CANVAS_H] = canvas.height;
    f32[INDICES.TIME_DILATION] = 3.0;
    printf(
        "[main] initial canvas and mouse state written to shared buffer\n\tmouse_x = %d\n\tmouse_y = %d\n\tcanvas_w = %d\n\tcanvas_y = %d\n\ttime dilation = %d",
        f32[INDICES.MOUSE_X],
        f32[INDICES.MOUSE_Y],
        f32[INDICES.CANVAS_W],
        f32[INDICES.CANVAS_H],
        f32[INDICES.TIME_DILATION],
    );

    const gl_state = init_webgl(canvas);
    printf("[main] WebGL initialized");

    const { xs, ys, vxs, vys, crs, cgs, cbs, len } = await make_logic_worker(
        memory,
        shared_comm_buf,
        canvas.width,
        canvas.height,
    );
    const pointers = { xs, ys, vxs, vys, crs, cgs, cbs, len };
    printf("[main] logic worker initialized and wasm pointers received");
    for (const key in pointers) {
        printf("\t%s = %p", key, pointers[key]);
    }

    let last_w = 0;
    let last_h = 0;

    function frame() {
        const cw = f32[INDICES.CANVAS_W];
        const ch = f32[INDICES.CANVAS_H];
        if (cw !== last_w || ch !== last_h) {
            last_w = cw;
            last_h = ch;
            canvas.width = cw;
            canvas.height = ch;
        }

        draw_webgl(gl_state, memory, pointers, cw, ch);
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
    printf("[main] render loop started");

    register_events(shared_comm_buf);
    printf("[main] event listeners registered");

    printf("[main] done");
}

async function make_logic_worker(memory, shared_comm_buf, width, height) {
    return new Promise((res) => {
        const logicWorker = new Worker("js/worker_logic.js", { type: "module" });

        logicWorker.postMessage({
            op: CONSTANTS.OP_INIT,
            payload: {
                memory,
                shared_comm_buf,
                width,
                height,
            },
        });

        logicWorker.onmessage = (e) => {
            if (e.data.op === CONSTANTS.OP_READY) {
                res(e.data.payload);
            }
        };
    });
}
