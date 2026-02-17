let wasm;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(takeObject(mem.getUint32(i, true)));
    }
    return result;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export(addHeapObject(e));
    }
}

let heap = new Array(128).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

let WASM_VECTOR_LEN = 0;

const GameObjectFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gameobject_free(ptr >>> 0, 1));

const GameStateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gamestate_free(ptr >>> 0, 1));

const HsvFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_hsv_free(ptr >>> 0, 1));

const RenderInformationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_renderinformation_free(ptr >>> 0, 1));

const RgbFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rgb_free(ptr >>> 0, 1));

const rsVector2Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rsvector2_free(ptr >>> 0, 1));

export class GameObject {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GameObjectFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_gameobject_free(ptr, 0);
    }
}
if (Symbol.dispose) GameObject.prototype[Symbol.dispose] = GameObject.prototype.free;

export class GameState {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(GameState.prototype);
        obj.__wbg_ptr = ptr;
        GameStateFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GameStateFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_gamestate_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get object_amount() {
        const ret = wasm.__wbg_get_gamestate_object_amount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set object_amount(arg0) {
        wasm.__wbg_set_gamestate_object_amount(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get canvas_w() {
        const ret = wasm.__wbg_get_gamestate_canvas_w(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set canvas_w(arg0) {
        wasm.__wbg_set_gamestate_canvas_w(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get canvas_h() {
        const ret = wasm.__wbg_get_gamestate_canvas_h(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set canvas_h(arg0) {
        wasm.__wbg_set_gamestate_canvas_h(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {boolean}
     */
    get help_menu() {
        const ret = wasm.__wbg_get_gamestate_help_menu(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set help_menu(arg0) {
        wasm.__wbg_set_gamestate_help_menu(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {boolean}
     */
    get mouse_prevent() {
        const ret = wasm.__wbg_get_gamestate_mouse_prevent(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set mouse_prevent(arg0) {
        wasm.__wbg_set_gamestate_mouse_prevent(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {boolean}
     */
    get obliterated() {
        const ret = wasm.__wbg_get_gamestate_obliterated(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set obliterated(arg0) {
        wasm.__wbg_set_gamestate_obliterated(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {boolean}
     */
    get clamping_behavior() {
        const ret = wasm.__wbg_get_gamestate_clamping_behavior(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set clamping_behavior(arg0) {
        wasm.__wbg_set_gamestate_clamping_behavior(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get line_offset() {
        const ret = wasm.__wbg_get_gamestate_line_offset(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set line_offset(arg0) {
        wasm.__wbg_set_gamestate_line_offset(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get grid_divisor() {
        const ret = wasm.__wbg_get_gamestate_grid_divisor(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set grid_divisor(arg0) {
        wasm.__wbg_set_gamestate_grid_divisor(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get grid_spacing_px() {
        const ret = wasm.__wbg_get_gamestate_grid_spacing_px(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set grid_spacing_px(arg0) {
        wasm.__wbg_set_gamestate_grid_spacing_px(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get physics_resolution() {
        const ret = wasm.__wbg_get_gamestate_physics_resolution(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set physics_resolution(arg0) {
        wasm.__wbg_set_gamestate_physics_resolution(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {boolean}
     */
    get neo_physics_handler() {
        const ret = wasm.__wbg_get_gamestate_neo_physics_handler(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set neo_physics_handler(arg0) {
        wasm.__wbg_set_gamestate_neo_physics_handler(this.__wbg_ptr, arg0);
    }
    /**
     * @param {string} key
     */
    pressed_key(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export2, wasm.__wbindgen_export3);
        const len0 = WASM_VECTOR_LEN;
        wasm.gamestate_pressed_key(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} key
     */
    released_key(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export2, wasm.__wbindgen_export3);
        const len0 = WASM_VECTOR_LEN;
        wasm.gamestate_released_key(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} new_timestamp
     * @returns {number}
     */
    update_timer(new_timestamp) {
        const ret = wasm.gamestate_update_timer(this.__wbg_ptr, new_timestamp);
        return ret;
    }
    /**
     * @param {string} key
     * @returns {boolean}
     */
    is_key_pressed(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export2, wasm.__wbindgen_export3);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gamestate_is_key_pressed(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    get_test_string() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.gamestate_get_test_string(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    update_mouse_position(x, y) {
        wasm.gamestate_set_mouse(this.__wbg_ptr, x, y);
    }
    decrease_time_dilation() {
        wasm.gamestate_decrease_time_dilation(this.__wbg_ptr);
    }
    increase_time_dilation() {
        wasm.gamestate_increase_time_dilation(this.__wbg_ptr);
    }
    handle_mouse_left_click() {
        wasm.gamestate_handle_mouse_left_click(this.__wbg_ptr);
    }
    handle_mouse_right_click() {
        wasm.gamestate_handle_mouse_right_click(this.__wbg_ptr);
    }
    /**
     * @param {string} key
     */
    handle_tactile_keystroke(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export2, wasm.__wbindgen_export3);
        const len0 = WASM_VECTOR_LEN;
        wasm.gamestate_handle_tactile_keystroke(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} object_amount
     * @param {number} canvas_w
     * @param {number} canvas_h
     * @param {rsVector2} mouse_position
     * @param {number} hashnet_size
     * @param {number} time_dilation
     * @param {number} start_time
     * @returns {GameState}
     */
    static new(object_amount, canvas_w, canvas_h, mouse_position, hashnet_size, time_dilation, start_time) {
        _assertClass(mouse_position, rsVector2);
        var ptr0 = mouse_position.__destroy_into_raw();
        const ret = wasm.gamestate_new(object_amount, canvas_w, canvas_h, ptr0, hashnet_size, time_dilation, start_time);
        return GameState.__wrap(ret);
    }
    /**
     * @param {Float64Array} f64a
     */
    render(f64a) {
        wasm.gamestate_render(this.__wbg_ptr, addHeapObject(f64a));
    }
    /**
     * @param {number} dt
     */
    update(dt) {
        wasm.gamestate_update(this.__wbg_ptr, dt);
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    set_mouse(x, y) {
        wasm.gamestate_set_mouse(this.__wbg_ptr, x, y);
    }
}
if (Symbol.dispose) GameState.prototype[Symbol.dispose] = GameState.prototype.free;

export class Hsv {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Hsv.prototype);
        obj.__wbg_ptr = ptr;
        HsvFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HsvFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_hsv_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get h() {
        const ret = wasm.__wbg_get_hsv_h(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set h(arg0) {
        wasm.__wbg_set_hsv_h(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get s() {
        const ret = wasm.__wbg_get_hsv_s(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set s(arg0) {
        wasm.__wbg_set_hsv_s(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get v() {
        const ret = wasm.__wbg_get_hsv_v(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set v(arg0) {
        wasm.__wbg_set_hsv_v(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {Rgb}
     */
    to_rgb() {
        const ret = wasm.hsv_to_rgb(this.__wbg_ptr);
        return Rgb.__wrap(ret);
    }
    /**
     * @param {number} degrees
     * @returns {Hsv}
     */
    rot_hue(degrees) {
        const ret = wasm.hsv_rot_hue(this.__wbg_ptr, degrees);
        return Hsv.__wrap(ret);
    }
}
if (Symbol.dispose) Hsv.prototype[Symbol.dispose] = Hsv.prototype.free;

export class RenderInformation {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RenderInformationFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_renderinformation_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get line_width() {
        const ret = wasm.__wbg_get_hsv_h(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set line_width(arg0) {
        wasm.__wbg_set_hsv_h(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get posx() {
        const ret = wasm.__wbg_get_hsv_s(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set posx(arg0) {
        wasm.__wbg_set_hsv_s(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get posy() {
        const ret = wasm.__wbg_get_hsv_v(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set posy(arg0) {
        wasm.__wbg_set_hsv_v(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get tvx() {
        const ret = wasm.__wbg_get_renderinformation_tvx(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set tvx(arg0) {
        wasm.__wbg_set_renderinformation_tvx(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get tvy() {
        const ret = wasm.__wbg_get_renderinformation_tvy(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set tvy(arg0) {
        wasm.__wbg_set_renderinformation_tvy(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get sqx() {
        const ret = wasm.__wbg_get_renderinformation_sqx(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set sqx(arg0) {
        wasm.__wbg_set_renderinformation_sqx(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get sqy() {
        const ret = wasm.__wbg_get_renderinformation_sqy(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set sqy(arg0) {
        wasm.__wbg_set_renderinformation_sqy(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get sx() {
        const ret = wasm.__wbg_get_renderinformation_sx(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set sx(arg0) {
        wasm.__wbg_set_renderinformation_sx(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get sy() {
        const ret = wasm.__wbg_get_renderinformation_sy(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set sy(arg0) {
        wasm.__wbg_set_renderinformation_sy(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get r() {
        const ret = wasm.__wbg_get_renderinformation_r(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set r(arg0) {
        wasm.__wbg_set_renderinformation_r(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get g() {
        const ret = wasm.__wbg_get_gamestate_canvas_w(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set g(arg0) {
        wasm.__wbg_set_gamestate_canvas_w(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get b() {
        const ret = wasm.__wbg_get_gamestate_canvas_h(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set b(arg0) {
        wasm.__wbg_set_gamestate_canvas_h(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) RenderInformation.prototype[Symbol.dispose] = RenderInformation.prototype.free;

export class Rgb {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Rgb.prototype);
        obj.__wbg_ptr = ptr;
        RgbFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RgbFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rgb_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get r() {
        const ret = wasm.__wbg_get_hsv_h(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set r(arg0) {
        wasm.__wbg_set_hsv_h(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get g() {
        const ret = wasm.__wbg_get_hsv_s(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set g(arg0) {
        wasm.__wbg_set_hsv_s(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get b() {
        const ret = wasm.__wbg_get_hsv_v(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set b(arg0) {
        wasm.__wbg_set_hsv_v(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) Rgb.prototype[Symbol.dispose] = Rgb.prototype.free;

/**
 * @param {string} name
 */
export function greet(name) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export2, wasm.__wbindgen_export3);
    const len0 = WASM_VECTOR_LEN;
    wasm.greet(ptr0, len0);
}

export class rsVector2 {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(rsVector2.prototype);
        obj.__wbg_ptr = ptr;
        rsVector2Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        rsVector2Finalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rsvector2_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get x() {
        const ret = wasm.__wbg_get_hsv_h(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set x(arg0) {
        wasm.__wbg_set_hsv_h(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get y() {
        const ret = wasm.__wbg_get_hsv_s(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set y(arg0) {
        wasm.__wbg_set_hsv_s(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {rsVector2}
     */
    make_clone() {
        const ret = wasm.rsvector2_make_clone(this.__wbg_ptr);
        return rsVector2.__wrap(ret);
    }
    /**
     * @param {number} amount
     * @param {number} randomization_factor
     * @returns {rsVector2[]}
     */
    divide_rand(amount, randomization_factor) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rsvector2_divide_rand(retptr, this.__wbg_ptr, amount, randomization_factor);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {rsVector2} consume_target
     * @param {rsVector2} unit_size
     */
    one_over_d_sq(consume_target, unit_size) {
        _assertClass(consume_target, rsVector2);
        var ptr0 = consume_target.__destroy_into_raw();
        _assertClass(unit_size, rsVector2);
        wasm.rsvector2_one_over_d_sq(this.__wbg_ptr, ptr0, unit_size.__wbg_ptr);
    }
    /**
     * @param {rsVector2} other
     */
    to(other) {
        _assertClass(other, rsVector2);
        wasm.rsvector2_to(this.__wbg_ptr, other.__wbg_ptr);
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    add(x, y) {
        wasm.rsvector2_add(this.__wbg_ptr, x, y);
    }
    /**
     * @returns {Float64Array}
     */
    arr() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rsvector2_arr(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 8, 8);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {number}
     */
    mag() {
        const ret = wasm.rsvector2_mag(this.__wbg_ptr);
        return ret;
    }
    neg() {
        wasm.rsvector2_neg(this.__wbg_ptr);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @returns {rsVector2}
     */
    static new(x, y) {
        const ret = wasm.rsvector2_new(x, y);
        return rsVector2.__wrap(ret);
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    set(x, y) {
        wasm.gamestate_set_mouse(this.__wbg_ptr, x, y);
    }
    /**
     * @param {rsVector2} other
     */
    from(other) {
        _assertClass(other, rsVector2);
        wasm.rsvector2_from(this.__wbg_ptr, other.__wbg_ptr);
    }
    /**
     * @returns {number}
     */
    get_x() {
        const ret = wasm.rsvector2_get_x(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_y() {
        const ret = wasm.rsvector2_get_y(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} factor
     */
    scale(factor) {
        wasm.rsvector2_scale(this.__wbg_ptr, factor);
    }
    /**
     * @param {number} amount
     * @returns {rsVector2[]}
     */
    divide(amount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rsvector2_divide(retptr, this.__wbg_ptr, amount);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} angle
     */
    rotate(angle) {
        wasm.rsvector2_rotate(this.__wbg_ptr, angle);
    }
    square() {
        wasm.rsvector2_square(this.__wbg_ptr);
    }
    /**
     * @param {rsVector2} other
     */
    add_vec(other) {
        _assertClass(other, rsVector2);
        wasm.rsvector2_add_vec(this.__wbg_ptr, other.__wbg_ptr);
    }
    /**
     * @param {rsVector2} other
     */
    set_vec(other) {
        _assertClass(other, rsVector2);
        wasm.rsvector2_set_vec(this.__wbg_ptr, other.__wbg_ptr);
    }
    normalize() {
        wasm.rsvector2_normalize(this.__wbg_ptr);
    }
    /**
     * @param {rsVector2} other
     */
    scale_vec(other) {
        _assertClass(other, rsVector2);
        wasm.rsvector2_scale_vec(this.__wbg_ptr, other.__wbg_ptr);
    }
}
if (Symbol.dispose) rsVector2.prototype[Symbol.dispose] = rsVector2.prototype.free;

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg___wbindgen_is_function_8d400b8b1af978cd = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_object_ce774f3490692386 = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_string_704ef9c8fc131030 = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_undefined_f6b95eab589e0269 = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_alert_2f4333a3782b9f51 = function(arg0, arg1) {
        alert(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_call_3020136f7a2d6e44 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_abb4ff46ce38be40 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_574e78ad8b13b65f = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_b8f5dbd5f3995a9e = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_length_22ac23eaec9d8053 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_msCrypto_a61aeb35a24c1329 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_no_args_cb138f77cf6151ee = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_with_length_aa5eaf41d35235e5 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_905d3e251edff8a2 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_process_dc0fbacc7c1c06f7 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_prototypesetcall_dfe9b766cdc1f1fd = function(arg0, arg1, arg2) {
        Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), getObject(arg2));
    };
    imports.wbg.__wbg_randomFillSync_ac0988aba3254290 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_require_60cc747a6bc5215a = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_rsvector2_new = function(arg0) {
        const ret = rsVector2.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_index_021489b2916af13e = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = arg2;
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_769e6b65d6557335 = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1 = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_08f5a74c69739274 = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_a8924b26aa92d024 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_845f2f5bce7d061a = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_c01dfd4722a88165 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_cb9088102bce6b30 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
        const ret = getArrayU8FromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;



    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('hashnet_lib_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
