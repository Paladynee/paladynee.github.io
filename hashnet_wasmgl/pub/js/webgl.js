const VERT_SRC = `#version 300 es

// unit quad geometry
in vec2 a_quad;

// per-instance SoA attributes
in float a_x;
in float a_y;
in float a_vx;
in float a_vy;
in float a_is_tail;
in float a_r;
in float a_g;
in float a_b;

const float a_w = 10.0;
const float a_h = 10.0;

uniform vec2 u_resolution;

out vec3 v_color;

void main() {
    vec2 body_pos = vec2(a_x, a_y) + a_quad * vec2(a_w, a_h);

    // 0 = exact fast path (inversesqrt), 1 = approximation path (fewer expensive ops)
    const int FAST_APPROX_NORM = 1;
    const float INV_SQRT_1000 = 0.0316227766;
    const float EPS = 1e-12;

    vec2 vel = vec2(a_vx, a_vy);
    float trail_len;
    vec2 dir;

    if (FAST_APPROX_NORM == 1) {
        // |v| ≈ max(ax, ay) + 0.375 * min(ax, ay)
        float ax = abs(vel.x);
        float ay = abs(vel.y);
        float maxc = max(ax, ay);
        float minc = min(ax, ay);
        float speed_approx = max(maxc + 0.375 * minc, 1e-6);
        float inv_speed = 1.0 / speed_approx;
        dir = -vel * inv_speed;
        trail_len = speed_approx * INV_SQRT_1000;
    } else {
        float speed2 = dot(vel, vel);
        float inv_speed = inversesqrt(max(speed2, EPS));
        dir = -vel * inv_speed;
        trail_len = (speed2 * inv_speed) * INV_SQRT_1000;
    }

    vec2 perp = vec2(-dir.y, dir.x);
    float half_width = max(min(a_w, a_h) * 0.5, 0.5);
    vec2 center = vec2(a_x, a_y) + vec2(a_w, a_h) * 0.5;

    vec2 tail_pos = center
        + dir * (a_quad.x * trail_len)
        + perp * ((a_quad.y * 2.0 - 1.0) * half_width);

    vec2 pos = mix(body_pos, tail_pos, a_is_tail);
    vec2 clip = (pos / u_resolution) * 2.0 - 1.0;
    clip.y = -clip.y;
    gl_Position = vec4(clip, 0.0, 1.0);
    v_color = vec3(a_r, a_g, a_b);
}
`;

const FRAG_SRC = `#version 300 es
precision mediump float;

in vec3 v_color;
out vec4 frag_color;

void main() {
    frag_color = vec4(v_color, 0.85);
}
`;

const BG_VERT_SRC = `#version 300 es

in vec2 a_pos;

void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const BG_FRAG_SRC = `#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 frag_color;

void main() {
    const float CELL_SIZE_PX = 56.0;
    const float LINE_HALF_WIDTH_PX = 1.0; // total line width = 2 px
    const float SPEED_PX_PER_SEC = 40.0;

    // In screen coordinates (top-left origin), motion is top-left -> bottom-right.
    // gl_FragCoord has bottom-left origin, so this direction maps to (+x, -y).
    vec2 velocity = vec2(1.0, -1.0) * SPEED_PX_PER_SEC;
    vec2 p = gl_FragCoord.xy - velocity * u_time;

    vec2 cell = mod(p, CELL_SIZE_PX);
    float edge_dist = min(min(cell.x, CELL_SIZE_PX - cell.x), min(cell.y, CELL_SIZE_PX - cell.y));
    float line_main = 1.0 - step(LINE_HALF_WIDTH_PX, edge_dist);

    vec3 bg = vec3(25.0 / 255.0, 23.0 / 255.0, 36.0 / 255.0);
    vec3 grid_color = vec3(64.0 / 255.0); // #404040
    vec3 col = mix(bg, grid_color, line_main);

    frag_color = vec4(col, 1.0);
}
`;

/// Compiles a WebGL shader from the provided source string.
///
/// Returns the compiled shader object, or throws an error if compilation fails.
function compile_shader(gl, type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("shader compile failed: " + log);
    }
    return shader;
}

/// Links a vertex and fragment shader into a single WebGL program.
///
/// Returns the linked program object, or throws an error if linking fails.
function link_program(gl, vert, frag) {
    const prog = gl.createProgram();
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(prog);
        gl.deleteProgram(prog);
        throw new Error("program link failed: " + log);
    }
    return prog;
}

/// Initializes the WebGL2 context and sets up buffers, shaders, and vertex array objects for instanced rendering.
///
/// Returns an object containing the WebGL context and handles to persistent GPU resources.
function init_webgl(canvas) {
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!gl) throw new Error("WebGL2 not supported");

    const bg_vert = compile_shader(gl, gl.VERTEX_SHADER, BG_VERT_SRC);
    const bg_frag = compile_shader(gl, gl.FRAGMENT_SHADER, BG_FRAG_SRC);
    const bg_program = link_program(gl, bg_vert, bg_frag);
    gl.deleteShader(bg_vert);
    gl.deleteShader(bg_frag);

    gl.useProgram(bg_program);
    const u_bg_resolution = gl.getUniformLocation(bg_program, "u_resolution");
    const u_bg_time = gl.getUniformLocation(bg_program, "u_time");
    const loc_bg_pos = gl.getAttribLocation(bg_program, "a_pos");

    const bg_vao = gl.createVertexArray();
    gl.bindVertexArray(bg_vao);

    const bg_vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bg_vbo);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(loc_bg_pos);
    gl.vertexAttribPointer(loc_bg_pos, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);

    const vert = compile_shader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const frag = compile_shader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    const program = link_program(gl, vert, frag);
    gl.deleteShader(vert);
    gl.deleteShader(frag);

    gl.useProgram(program);

    const u_resolution = gl.getUniformLocation(program, "u_resolution");

    // attribute locations
    const loc_quad = gl.getAttribLocation(program, "a_quad");
    const loc_is_tail = gl.getAttribLocation(program, "a_is_tail");
    const loc_x = gl.getAttribLocation(program, "a_x");
    const loc_y = gl.getAttribLocation(program, "a_y");
    const loc_vx = gl.getAttribLocation(program, "a_vx");
    const loc_vy = gl.getAttribLocation(program, "a_vy");
    const loc_r = gl.getAttribLocation(program, "a_r");
    const loc_g = gl.getAttribLocation(program, "a_g");
    const loc_b = gl.getAttribLocation(program, "a_b");

    // two unit quads (body + tail), each as 4 vertices.
    const quad_vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad_vbo);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1]),
        gl.STATIC_DRAW,
    );

    const tail_flag_vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tail_flag_vbo);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([0, 0, 0, 0, 1, 1, 1, 1]),
        gl.STATIC_DRAW,
    );

    const quad_ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad_ebo);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array([0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7]),
        gl.STATIC_DRAW,
    );

    // per-instance buffers (one per SoA array)
    const x_buf = gl.createBuffer();
    const y_buf = gl.createBuffer();
    const vx_buf = gl.createBuffer();
    const vy_buf = gl.createBuffer();
    const r_buf = gl.createBuffer();
    const g_buf = gl.createBuffer();
    const b_buf = gl.createBuffer();

    // VAO
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // quad vertex attribute (per-vertex, divisor 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, quad_vbo);
    gl.enableVertexAttribArray(loc_quad);
    gl.vertexAttribPointer(loc_quad, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tail_flag_vbo);
    gl.enableVertexAttribArray(loc_is_tail);
    gl.vertexAttribPointer(loc_is_tail, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad_ebo);

    // per-instance float attributes (position)
    const float_locs = [loc_x, loc_y, loc_vx, loc_vy];
    const float_bufs = [x_buf, y_buf, vx_buf, vy_buf];
    for (let i = 0; i < float_locs.length; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, float_bufs[i]);
        gl.enableVertexAttribArray(float_locs[i]);
        gl.vertexAttribPointer(float_locs[i], 1, gl.FLOAT, false, 0, 0);
        gl.vertexAttribDivisor(float_locs[i], 1);
    }

    // per-instance u8 attributes (color), normalized to [0,1] by gpu
    const color_locs = [loc_r, loc_g, loc_b];
    const color_bufs = [r_buf, g_buf, b_buf];
    for (let i = 0; i < color_locs.length; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, color_bufs[i]);
        gl.enableVertexAttribArray(color_locs[i]);
        gl.vertexAttribPointer(color_locs[i], 1, gl.UNSIGNED_BYTE, true, 0, 0);
        gl.vertexAttribDivisor(color_locs[i], 1);
    }

    gl.bindVertexArray(null);
    gl.enable(gl.BLEND);
    gl.enable(gl.MULTISAMPLE);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.clearColor(25 / 255, 23 / 255, 36 / 255, 1.0);

    return {
        gl,
        bg_program,
        bg_vao,
        u_bg_resolution,
        u_bg_time,
        start_time_s: performance.now() * 0.001,
        program,
        vao,
        u_resolution,
        index_count: 12,
        float_bufs,
        color_bufs,
        upload_capacity: 0,
        views_mem_buffer: null,
        views_count: 0,
        views_ptrs: null,
        float_arrays: null,
        color_arrays: null,
    };
}

/// Renders a frame using instanced WebGL2 drawing.
///
/// Updates GPU buffers with data from Wasm memory and executes an instanced draw call for all particles.
function draw_webgl(
    state,
    mem,
    { xs, ys, vxs, vys, crs, cgs, cbs, len },
    canvas_w,
    canvas_h,
) {
    const {
        gl,
        bg_program,
        bg_vao,
        u_bg_resolution,
        u_bg_time,
        start_time_s,
        program,
        vao,
        u_resolution,
        index_count,
        float_bufs,
        color_bufs,
    } = state;

    gl.viewport(0, 0, canvas_w, canvas_h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(bg_program);
    gl.uniform2f(u_bg_resolution, canvas_w, canvas_h);
    gl.uniform1f(u_bg_time, performance.now() * 0.001 - start_time_s);
    gl.bindVertexArray(bg_vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.useProgram(program);
    gl.uniform2f(u_resolution, canvas_w, canvas_h);

    const ptrs = [xs, ys, vxs, vys, crs, cgs, cbs];
    const ptrs_changed =
        !state.views_ptrs || state.views_ptrs.some((p, i) => p !== ptrs[i]);
    if (
        state.views_mem_buffer !== mem.buffer ||
        state.views_count !== len ||
        ptrs_changed
    ) {
        state.views_mem_buffer = mem.buffer;
        state.views_count = len;
        state.views_ptrs = ptrs;
        state.float_arrays = [
            new Float32Array(mem.buffer, xs, len),
            new Float32Array(mem.buffer, ys, len),
            new Float32Array(mem.buffer, vxs, len),
            new Float32Array(mem.buffer, vys, len),
        ];
        state.color_arrays = [
            new Uint8Array(mem.buffer, crs, len),
            new Uint8Array(mem.buffer, cgs, len),
            new Uint8Array(mem.buffer, cbs, len),
        ];
    }

    if (state.upload_capacity !== len) {
        state.upload_capacity = len;
        const float_byte_length = len * 4;
        const color_byte_length = len;

        for (let i = 0; i < float_bufs.length; i++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, float_bufs[i]);
            gl.bufferData(gl.ARRAY_BUFFER, float_byte_length, gl.DYNAMIC_DRAW);
        }

        for (let i = 0; i < color_bufs.length; i++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, color_bufs[i]);
            gl.bufferData(gl.ARRAY_BUFFER, color_byte_length, gl.DYNAMIC_DRAW);
        }
    }

    gl.bindVertexArray(vao);

    for (let i = 0; i < float_bufs.length; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, float_bufs[i]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, state.float_arrays[i]);
    }

    for (let i = 0; i < color_bufs.length; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, color_bufs[i]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, state.color_arrays[i]);
    }

    gl.drawElementsInstanced(gl.TRIANGLES, index_count, gl.UNSIGNED_SHORT, 0, len);

    gl.bindVertexArray(null);
}

export { init_webgl, draw_webgl };
