//! A high-performance particle simulation rendered via WebAssembly and WebGL2.
//!
//! This library provides the core physics and state management for a 2D particle system,
//! designed to be called from intensive JavaScript rendering loops.
#![feature(core_intrinsics, wasm_numeric_instr)]
#![allow(static_mut_refs, internal_features)]
#![no_std]

extern crate alloc;
extern crate dlmalloc;

pub mod exports;
mod imp;
