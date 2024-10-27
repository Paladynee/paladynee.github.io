let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
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

let cachedFloat64ArrayMemory0 = null;

function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

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
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}
/**
 * @param {string} name
 */
export function greet(name) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2);
    const len0 = WASM_VECTOR_LEN;
    wasm.greet(ptr0, len0);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_3(addHeapObject(e));
    }
}

const GameObjectFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gameobject_free(ptr >>> 0, 1));

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

const GameStateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gamestate_free(ptr >>> 0, 1));

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
     * @param {number} dt
     */
    update(dt) {
        wasm.gamestate_update(this.__wbg_ptr, dt);
    }
    /**
     * @param {string} key
     */
    pressed_key(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        wasm.gamestate_pressed_key(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} key
     */
    released_key(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        wasm.gamestate_released_key(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} key
     * @returns {boolean}
     */
    is_key_pressed(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gamestate_is_key_pressed(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    update_mouse_position(x, y) {
        wasm.gamestate_set_mouse(this.__wbg_ptr, x, y);
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
            wasm.__wbindgen_export_0(deferred1_0, deferred1_1, 1);
        }
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
     */
    handle_tactile_keystroke(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        wasm.gamestate_handle_tactile_keystroke(this.__wbg_ptr, ptr0, len0);
    }
    handle_mouse_left_click() {
        wasm.gamestate_handle_mouse_left_click(this.__wbg_ptr);
    }
    handle_mouse_right_click() {
        wasm.gamestate_handle_mouse_right_click(this.__wbg_ptr);
    }
    /**
     * @param {Float64Array} f64a
     */
    render(f64a) {
        wasm.gamestate_render(this.__wbg_ptr, addHeapObject(f64a));
    }
    increase_time_dilation() {
        wasm.gamestate_increase_time_dilation(this.__wbg_ptr);
    }
    decrease_time_dilation() {
        wasm.gamestate_decrease_time_dilation(this.__wbg_ptr);
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    set_mouse(x, y) {
        wasm.gamestate_set_mouse(this.__wbg_ptr, x, y);
    }
}

const HsvFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_hsv_free(ptr >>> 0, 1));

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
     * @param {number} degrees
     * @returns {Hsv}
     */
    rot_hue(degrees) {
        const ret = wasm.hsv_rot_hue(this.__wbg_ptr, degrees);
        return Hsv.__wrap(ret);
    }
    /**
     * @returns {Rgb}
     */
    to_rgb() {
        const ret = wasm.hsv_to_rgb(this.__wbg_ptr);
        return Rgb.__wrap(ret);
    }
}

const RenderInformationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_renderinformation_free(ptr >>> 0, 1));

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

const RgbFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rgb_free(ptr >>> 0, 1));

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

const rsVector2Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rsvector2_free(ptr >>> 0, 1));

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
     * @param {number} x
     * @param {number} y
     * @returns {rsVector2}
     */
    static new(x, y) {
        const ret = wasm.rsvector2_new(x, y);
        return rsVector2.__wrap(ret);
    }
    /**
     * @returns {rsVector2}
     */
    make_clone() {
        const ret = wasm.rsvector2_make_clone(this.__wbg_ptr);
        return rsVector2.__wrap(ret);
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
     * @param {rsVector2} other
     */
    set_vec(other) {
        _assertClass(other, rsVector2);
        wasm.rsvector2_set_vec(this.__wbg_ptr, other.__wbg_ptr);
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
    add_vec(other) {
        _assertClass(other, rsVector2);
        wasm.rsvector2_add_vec(this.__wbg_ptr, other.__wbg_ptr);
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    add(x, y) {
        wasm.rsvector2_add(this.__wbg_ptr, x, y);
    }
    /**
     * @param {number} factor
     */
    scale(factor) {
        wasm.rsvector2_scale(this.__wbg_ptr, factor);
    }
    /**
     * @param {rsVector2} other
     */
    scale_vec(other) {
        _assertClass(other, rsVector2);
        wasm.rsvector2_scale_vec(this.__wbg_ptr, other.__wbg_ptr);
    }
    normalize() {
        wasm.rsvector2_normalize(this.__wbg_ptr);
    }
    /**
     * @returns {number}
     */
    mag() {
        const ret = wasm.rsvector2_mag(this.__wbg_ptr);
        return ret;
    }
    square() {
        wasm.rsvector2_square(this.__wbg_ptr);
    }
    /**
     * @param {rsVector2} other
     */
    to(other) {
        _assertClass(other, rsVector2);
        wasm.rsvector2_to(this.__wbg_ptr, other.__wbg_ptr);
    }
    /**
     * @param {rsVector2} other
     */
    from(other) {
        _assertClass(other, rsVector2);
        wasm.rsvector2_from(this.__wbg_ptr, other.__wbg_ptr);
    }
    neg() {
        wasm.rsvector2_neg(this.__wbg_ptr);
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
     * @param {number} amount
     * @returns {(rsVector2)[]}
     */
    divide(amount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rsvector2_divide(retptr, this.__wbg_ptr, amount);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_0(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} amount
     * @param {number} randomization_factor
     * @returns {(rsVector2)[]}
     */
    divide_rand(amount, randomization_factor) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rsvector2_divide_rand(retptr, this.__wbg_ptr, amount, randomization_factor);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_0(r0, r1 * 4, 4);
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
            wasm.__wbindgen_export_0(r0, r1 * 8, 8);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
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
    imports.wbg.__wbg_rsvector2_new = function(arg0) {
        const ret = rsVector2.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setindex_77162735b81c57cf = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = arg2;
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_alert_88c6ecd8c27b42a7 = function(arg0, arg1) {
        alert(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_ccaed51a635d8a2d = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_7e3eb787208af730 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_5c9c955aa56b6049 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_subarray_975a06f9dbd16995 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_3aa56aa6edec874c = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_new_fec2611eb9180f95 = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_ec2fcf81bc573fd9 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_crypto_1d1f22824a6a080c = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_process_4a72847cc503995b = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_f686565e586dd935 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_104a2ff8d6ea03a2 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg_require_cca90b1a94a0255b = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_msCrypto_eb05e62b530a1508 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_76462a666eca145f = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_bf91bf94d9e04084 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_52dd9f07d03fd5f8 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_05c129bf37fcf1be = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_3eca19bb09e9c484 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_newnoargs_1ede4bf2ebbaaf43 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_a9ef466721e824f2 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_3bfa248576352471 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

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

    __wbg_init_memory(imports);

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

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
