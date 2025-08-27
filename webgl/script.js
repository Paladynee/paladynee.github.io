/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("#canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    throw "WebGL is not supported";
}

function obj_parser(obj) {
    const lines = obj.split("\n");
    const vertices = [];
    const faces = [];
    for (const line of lines) {
        const parts = line.trim().split(/ +/);
        switch (parts[0]) {
            case "v":
                vertices.push(parts.slice(1).map(parseFloat));
                break;
            case "f":
                faces.push(parts.slice(1).map((x) => parseInt(x.trim().split("/")[0]) - 1));
                break;
        }
    }
    return { vertices, faces };
}

// convert vertices and faces to final vertex data
const teapot = obj_parser(teapot_obj);

// // to be initialized later in teapot.faces.map:
// // each face will have a random shade of gray
// const colorData = [];

const vertexData = teapot.faces
    .map((face) => {
        // // set color data
        // const random = Math.random();
        // colorData.push(random, random, random, random, random, random, random, random, random);

        // return vertex data
        return teapot.vertices[face[0]].concat(teapot.vertices[face[1]], teapot.vertices[face[2]]);
    })
    .flat();

const colorData = (function random_color_generation(vertices) {
    const arr = [];
    for (var i = 0; i < vertices; ++i) {
        // arr.push(Math.random(), Math.random(), Math.random());
        arr.push((i / vertices) % 1, 0, 0);
    }
    return arr;
})(Math.ceil(vertexData.length / 3));

// create buffer
const posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.DYNAMIC_DRAW);

// create buffer
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.DYNAMIC_DRAW);

// create shaders
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
    vertexShader,
    `
    precision mediump float;
    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;

    uniform mat4 matrix;

    void main() {
        vColor = color;
        gl_Position = matrix * vec4(position, 1);
    }
    `
);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
    fragmentShader,
    `
    precision mediump float;
    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1);
    }
    `
);
gl.compileShader(fragmentShader);

// create the program
const program = gl.createProgram();

// attach shaders to program
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// enable vertex attributes
// pos attrib
const posIdx = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(posIdx);
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
gl.vertexAttribPointer(posIdx, 3, gl.FLOAT, false, 0, 0);

// color attrib
const colorIdx = gl.getAttribLocation(program, "color");
gl.enableVertexAttribArray(colorIdx);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorIdx, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);

// uniform attributes
const uniformIdxs = {
    // matrix
    matrix: gl.getUniformLocation(program, "matrix"),
};

const held_keys = new Set();

addEventListener("keydown", (event) => {
    held_keys.add(event.code);
});

addEventListener("keyup", (event) => {
    held_keys.delete(event.code);
});

const controls = {
    KeyW: [0, 0, -1],
    KeyA: [-1, 0, 0],
    KeyS: [0, 0, 1],
    KeyD: [1, 0, 0],
    Space: [0, 1, 0],
    KeyC: [0, -1, 0],
};

// define matrices
const model_matrix = mat4.create();
// mat4.translate(model_matrix, model_matrix, [0, 0, 0]);

const view_matrix = mat4.create();
mat4.translate(view_matrix, view_matrix, [0, 0, 10]);

const projection_matrix = mat4.create();
mat4.perspective(
    projection_matrix,
    // fov
    75 * (Math.PI / 180),
    // aspect ratio
    canvas.width / canvas.height,
    // near
    0.1,
    // far
    1000
);

// intermediate matrices: these get rewritten every frame
const inv_v_matrix = mat4.create();
const mv_matrix = mat4.create();
const mvp_matrix = mat4.create();

// draw
draw();

function draw() {
    requestAnimationFrame(draw);
    model_matrix_rot_logic();
    handle_keys();

    // invert the view matrix
    mat4.invert(inv_v_matrix, view_matrix);
    // view * model -> model-view
    mat4.multiply(mv_matrix, inv_v_matrix, model_matrix);
    // projection * model-view -> model-view-projection
    mat4.multiply(mvp_matrix, projection_matrix, mv_matrix);

    gl.uniformMatrix4fv(uniformIdxs.matrix, false, mvp_matrix);
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
}

function model_matrix_rot_logic() {
    let sin = Math.sin(Date.now() / 1000) ** 2;
    let cos = Math.cos(Date.now() / 1000) ** 2;
    mat4.rotateX(model_matrix, model_matrix, (Math.PI / 130) * sin);
    mat4.rotateY(model_matrix, model_matrix, (Math.PI / 72) * cos);
    mat4.rotateZ(model_matrix, model_matrix, (Math.PI / 89) * -sin);
}

function handle_keys() {
    for (const key of held_keys) {
        const control = controls[key];
        if (control?.length === 3) {
            const movement_speed = 1 / 10;
            mat4.translate(
                view_matrix,
                view_matrix,
                control.map((a) => a * movement_speed)
            );
        }
        // console.log(control);
    }
}
