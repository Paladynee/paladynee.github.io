# Copilot instructions for `hashnet_wasmgl`

## Project shape (read this first)
- This repo is a **Rust `no_std` WASM simulation core** with a **JavaScript WebGL2 renderer**.
- Runtime split:
  - `pub/js/main.js`: main thread owns canvas + render loop.
  - `pub/js/worker_logic.js`: worker owns simulation tick loop.
  - `src/imp/**`: Rust physics/input/state implementation.
- Rendering is JS-side; Rust exports raw SoA pointers (`get_draw_pointers`, `get_color_pointers`) and JS reads memory directly.

## Build + run workflow (project-specific)
- Build WASM via `./build` (debug) or `./build release` (release).
  - This compiles `target/wasm32-unknown-unknown/<mode>/hashnet_wasmgl.wasm` and copies it to `pub/hashnet_wasmgl.wasm`.
- Serve with COOP/COEP headers (required for `SharedArrayBuffer`): `./start_miniserve`.
- Stop server: `./stop_miniserve`.
- Rust target/flags are pinned in `.cargo/config.toml`:
  - default target `wasm32-unknown-unknown`
  - `-Zunstable-options`, `build-std`, shared-memory link args, atomics/simd flags.
- Assume nightly toolchain when touching build config.

## Critical cross-component contracts
- Shared comm buffer schema lives in `pub/js/shared_comm_buf.js` (`INDICES`, `CONSTANTS`, queue semantics).
- If buffer layout changes, update **all** of:
  - `pub/js/events.js` (writers)
  - `pub/js/worker_logic.js` (readers/consumers)
  - any Rust API calls depending on those values.
- WASM import/export boundary:
  - Rust JS imports in `src/imp/api/imports.rs` (`js_panic_write_bytes`, `js_panic_flush`, `js_print_int`).
  - Export wrappers are generated in `src/imp/api/symbols.rs` via the `externs!` macro.
  - Add new exported symbol by extending `externs!` and implementing `src/imp/api/symbols/<name>.rs`.

## Rust-side patterns to preserve
- Global singleton state pattern: `GlobalState::get_mut()` in `src/imp/core/global_state.rs` (single-thread assumption inside WASM).
- Keep hot loops allocation-free and pointer-based (see `src/imp/engine/physics.rs` and input modules).
- Single target policy: this project only targets `wasm32-unknown-unknown`; do not add `#[cfg(...)]` branches, target-gated code paths, or portability shims unless explicitly requested.
- Input model is intentionally split:
  - continuous controls in `src/imp/engine/input/continuous.rs`
  - discrete/tactile events in `src/imp/engine/input/tactile.rs`
- Panic/alloc are custom for wasm:
  - allocator: `src/imp/wasm/allocator.rs`
  - panic forwarding to JS: `src/imp/wasm/panic.rs`.
- Prefer visibility simplicity: avoid introducing new `pub(crate)` items unless there is a clear encapsulation reason.
- Keep imports unrolled: one `use` per line (no grouped/braced imports).
- Do not add fallback implementations for non-wasm targets; maintain only the canonical wasm path.
- Do not import directly from `crate::imp::*` ever: export from `crate::exports` then import elsewhere instead.

## JS-side patterns to preserve
- `pub/js/get_wasm.js` instantiates with imported shared memory (`--import-memory`); do not switch to auto memory creation.
- Logic worker loop uses `MessageChannel` self-scheduling (not `setInterval`) to avoid starving event handling.
- `pub/js/webgl.js` expects stable SoA pointer arrays and updates typed-array views only when memory buffer/pointers/count change.

## Editing guidance
- Prefer surgical edits in `src/imp/engine/input/*` for interaction behavior changes.
- For new controls, mirror behavior in `pub/index.html` help text and in the relevant input handler (`continuous.rs` or `tactile.rs`).
- Do not add std-dependent Rust APIs; crate is `#![no_std]` with `alloc` only.