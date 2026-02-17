/* tslint:disable */
/* eslint-disable */

export class GameObject {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
}

export class GameState {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  pressed_key(key: string): void;
  released_key(key: string): void;
  update_timer(new_timestamp: number): number;
  is_key_pressed(key: string): boolean;
  get_test_string(): string;
  update_mouse_position(x: number, y: number): void;
  decrease_time_dilation(): void;
  increase_time_dilation(): void;
  handle_mouse_left_click(): void;
  handle_mouse_right_click(): void;
  handle_tactile_keystroke(key: string): void;
  static new(object_amount: number, canvas_w: number, canvas_h: number, mouse_position: rsVector2, hashnet_size: number, time_dilation: number, start_time: number): GameState;
  render(f64a: Float64Array): void;
  update(dt: number): void;
  set_mouse(x: number, y: number): void;
  object_amount: number;
  canvas_w: number;
  canvas_h: number;
  help_menu: boolean;
  mouse_prevent: boolean;
  obliterated: boolean;
  clamping_behavior: boolean;
  line_offset: number;
  grid_divisor: number;
  grid_spacing_px: number;
  physics_resolution: number;
  neo_physics_handler: boolean;
}

export class Hsv {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  to_rgb(): Rgb;
  rot_hue(degrees: number): Hsv;
  h: number;
  s: number;
  v: number;
}

export class RenderInformation {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  line_width: number;
  posx: number;
  posy: number;
  tvx: number;
  tvy: number;
  sqx: number;
  sqy: number;
  sx: number;
  sy: number;
  r: number;
  g: number;
  b: number;
}

export class Rgb {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  r: number;
  g: number;
  b: number;
}

export function greet(name: string): void;

export class rsVector2 {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  make_clone(): rsVector2;
  divide_rand(amount: number, randomization_factor: number): rsVector2[];
  one_over_d_sq(consume_target: rsVector2, unit_size: rsVector2): void;
  to(other: rsVector2): void;
  add(x: number, y: number): void;
  arr(): Float64Array;
  mag(): number;
  neg(): void;
  static new(x: number, y: number): rsVector2;
  set(x: number, y: number): void;
  from(other: rsVector2): void;
  get_x(): number;
  get_y(): number;
  scale(factor: number): void;
  divide(amount: number): rsVector2[];
  rotate(angle: number): void;
  square(): void;
  add_vec(other: rsVector2): void;
  set_vec(other: rsVector2): void;
  normalize(): void;
  scale_vec(other: rsVector2): void;
  x: number;
  y: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_gameobject_free: (a: number, b: number) => void;
  readonly __wbg_gamestate_free: (a: number, b: number) => void;
  readonly __wbg_get_gamestate_canvas_h: (a: number) => number;
  readonly __wbg_get_gamestate_canvas_w: (a: number) => number;
  readonly __wbg_get_gamestate_clamping_behavior: (a: number) => number;
  readonly __wbg_get_gamestate_grid_divisor: (a: number) => number;
  readonly __wbg_get_gamestate_grid_spacing_px: (a: number) => number;
  readonly __wbg_get_gamestate_help_menu: (a: number) => number;
  readonly __wbg_get_gamestate_line_offset: (a: number) => number;
  readonly __wbg_get_gamestate_mouse_prevent: (a: number) => number;
  readonly __wbg_get_gamestate_neo_physics_handler: (a: number) => number;
  readonly __wbg_get_gamestate_object_amount: (a: number) => number;
  readonly __wbg_get_gamestate_obliterated: (a: number) => number;
  readonly __wbg_get_gamestate_physics_resolution: (a: number) => number;
  readonly __wbg_get_hsv_h: (a: number) => number;
  readonly __wbg_get_hsv_s: (a: number) => number;
  readonly __wbg_get_hsv_v: (a: number) => number;
  readonly __wbg_get_renderinformation_r: (a: number) => number;
  readonly __wbg_get_renderinformation_sqx: (a: number) => number;
  readonly __wbg_get_renderinformation_sqy: (a: number) => number;
  readonly __wbg_get_renderinformation_sx: (a: number) => number;
  readonly __wbg_get_renderinformation_sy: (a: number) => number;
  readonly __wbg_get_renderinformation_tvx: (a: number) => number;
  readonly __wbg_get_renderinformation_tvy: (a: number) => number;
  readonly __wbg_hsv_free: (a: number, b: number) => void;
  readonly __wbg_renderinformation_free: (a: number, b: number) => void;
  readonly __wbg_rsvector2_free: (a: number, b: number) => void;
  readonly __wbg_set_gamestate_canvas_h: (a: number, b: number) => void;
  readonly __wbg_set_gamestate_canvas_w: (a: number, b: number) => void;
  readonly __wbg_set_gamestate_clamping_behavior: (a: number, b: number) => void;
  readonly __wbg_set_gamestate_grid_divisor: (a: number, b: number) => void;
  readonly __wbg_set_gamestate_grid_spacing_px: (a: number, b: number) => void;
  readonly __wbg_set_gamestate_help_menu: (a: number, b: number) => void;
  readonly __wbg_set_gamestate_line_offset: (a: number, b: number) => void;
  readonly __wbg_set_gamestate_mouse_prevent: (a: number, b: number) => void;
  readonly __wbg_set_gamestate_neo_physics_handler: (a: number, b: number) => void;
  readonly __wbg_set_gamestate_object_amount: (a: number, b: number) => void;
  readonly __wbg_set_gamestate_obliterated: (a: number, b: number) => void;
  readonly __wbg_set_gamestate_physics_resolution: (a: number, b: number) => void;
  readonly __wbg_set_hsv_h: (a: number, b: number) => void;
  readonly __wbg_set_hsv_s: (a: number, b: number) => void;
  readonly __wbg_set_hsv_v: (a: number, b: number) => void;
  readonly __wbg_set_renderinformation_r: (a: number, b: number) => void;
  readonly __wbg_set_renderinformation_sqx: (a: number, b: number) => void;
  readonly __wbg_set_renderinformation_sqy: (a: number, b: number) => void;
  readonly __wbg_set_renderinformation_sx: (a: number, b: number) => void;
  readonly __wbg_set_renderinformation_sy: (a: number, b: number) => void;
  readonly __wbg_set_renderinformation_tvx: (a: number, b: number) => void;
  readonly __wbg_set_renderinformation_tvy: (a: number, b: number) => void;
  readonly gamestate_decrease_time_dilation: (a: number) => void;
  readonly gamestate_get_test_string: (a: number, b: number) => void;
  readonly gamestate_handle_mouse_left_click: (a: number) => void;
  readonly gamestate_handle_mouse_right_click: (a: number) => void;
  readonly gamestate_handle_tactile_keystroke: (a: number, b: number, c: number) => void;
  readonly gamestate_increase_time_dilation: (a: number) => void;
  readonly gamestate_is_key_pressed: (a: number, b: number, c: number) => number;
  readonly gamestate_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly gamestate_pressed_key: (a: number, b: number, c: number) => void;
  readonly gamestate_released_key: (a: number, b: number, c: number) => void;
  readonly gamestate_render: (a: number, b: number) => void;
  readonly gamestate_set_mouse: (a: number, b: number, c: number) => void;
  readonly gamestate_update: (a: number, b: number) => void;
  readonly gamestate_update_timer: (a: number, b: number) => number;
  readonly greet: (a: number, b: number) => void;
  readonly hsv_rot_hue: (a: number, b: number) => number;
  readonly hsv_to_rgb: (a: number) => number;
  readonly rsvector2_add: (a: number, b: number, c: number) => void;
  readonly rsvector2_add_vec: (a: number, b: number) => void;
  readonly rsvector2_arr: (a: number, b: number) => void;
  readonly rsvector2_divide: (a: number, b: number, c: number) => void;
  readonly rsvector2_divide_rand: (a: number, b: number, c: number, d: number) => void;
  readonly rsvector2_from: (a: number, b: number) => void;
  readonly rsvector2_get_x: (a: number) => number;
  readonly rsvector2_get_y: (a: number) => number;
  readonly rsvector2_mag: (a: number) => number;
  readonly rsvector2_make_clone: (a: number) => number;
  readonly rsvector2_neg: (a: number) => void;
  readonly rsvector2_new: (a: number, b: number) => number;
  readonly rsvector2_normalize: (a: number) => void;
  readonly rsvector2_one_over_d_sq: (a: number, b: number, c: number) => void;
  readonly rsvector2_rotate: (a: number, b: number) => void;
  readonly rsvector2_scale: (a: number, b: number) => void;
  readonly rsvector2_scale_vec: (a: number, b: number) => void;
  readonly rsvector2_set_vec: (a: number, b: number) => void;
  readonly rsvector2_square: (a: number) => void;
  readonly rsvector2_to: (a: number, b: number) => void;
  readonly __wbg_set_renderinformation_b: (a: number, b: number) => void;
  readonly __wbg_set_renderinformation_g: (a: number, b: number) => void;
  readonly __wbg_set_renderinformation_line_width: (a: number, b: number) => void;
  readonly __wbg_set_renderinformation_posx: (a: number, b: number) => void;
  readonly __wbg_set_renderinformation_posy: (a: number, b: number) => void;
  readonly __wbg_set_rgb_b: (a: number, b: number) => void;
  readonly __wbg_set_rgb_g: (a: number, b: number) => void;
  readonly __wbg_set_rgb_r: (a: number, b: number) => void;
  readonly __wbg_set_rsvector2_x: (a: number, b: number) => void;
  readonly __wbg_set_rsvector2_y: (a: number, b: number) => void;
  readonly __wbg_get_renderinformation_b: (a: number) => number;
  readonly __wbg_get_renderinformation_g: (a: number) => number;
  readonly __wbg_get_renderinformation_line_width: (a: number) => number;
  readonly __wbg_get_renderinformation_posx: (a: number) => number;
  readonly __wbg_get_renderinformation_posy: (a: number) => number;
  readonly __wbg_get_rgb_b: (a: number) => number;
  readonly __wbg_get_rgb_g: (a: number) => number;
  readonly __wbg_get_rgb_r: (a: number) => number;
  readonly __wbg_get_rsvector2_x: (a: number) => number;
  readonly __wbg_get_rsvector2_y: (a: number) => number;
  readonly gamestate_update_mouse_position: (a: number, b: number, c: number) => void;
  readonly rsvector2_set: (a: number, b: number, c: number) => void;
  readonly __wbg_rgb_free: (a: number, b: number) => void;
  readonly __wbindgen_export: (a: number) => void;
  readonly __wbindgen_export2: (a: number, b: number) => number;
  readonly __wbindgen_export3: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export4: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
