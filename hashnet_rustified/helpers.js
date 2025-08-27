function resize(can, state) {
    can.width = window.innerWidth;
    can.height = window.innerHeight;
    if (state !== undefined) {
        state.canvas_w = can.width;
        state.canvas_h = can.height;
    }
}

export { resize };
