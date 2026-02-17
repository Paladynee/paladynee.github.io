/// Calculates the base RGB color for a given hue at full saturation and full value.
///
/// Returns a 3-element array of floats representing Red, Green, and Blue channels in the range [0, 1].
pub const fn hsv_base_rgb(hue: f32) -> [f32; 3] {
    // normalize hue into [0, 360)
    let h = hue % 360.0;
    let h = if h < 0.0 { h + 360.0 } else { h };
    let sector = (h / 60.0) as u32;
    let x = 1.0 - ((h / 60.0) % 2.0 - 1.0).abs();
    match sector {
        0 => [1.0, x, 0.0],
        1 => [x, 1.0, 0.0],
        2 => [0.0, 1.0, x],
        3 => [0.0, x, 1.0],
        4 => [x, 0.0, 1.0],
        _ => [1.0, 0.0, x],
    }
}
