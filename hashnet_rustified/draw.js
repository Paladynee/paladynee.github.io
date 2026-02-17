let last_help_menu = undefined;
function draw(state, can, ctx) {
        if (last_help_menu !== undefined && state.help_menu != last_help_menu) {
                document.querySelector(".help-menu-overlay").style = state.help_menu ? "display: block" : "display: none";
                last_help_menu = state.help_menu;
        } else if (last_help_menu === undefined) {
                last_help_menu = state.help_menu;
        }
        ctx.clearRect(0, 0, can.width, can.height);

        let dt = state.update_timer(performance.now()) / 1000;

        if (dt > 0.1) dt = 0.1;
        if (dt <= 0) dt = 0.001;

        handle_background_grid(can, ctx, state.grid_spacing_px, state.grid_divisor, state.line_offset);
        if (!state.obliterated) state.line_offset = (state.line_offset + 0.5 + dt * 25) % state.grid_divisor;

        state.update(dt);

        // global variable render_array: Float64Array: [f64; 12 * object_amount]
        state.render(render_array);

        for (let i = state.object_amount - 1; i >= 0; i--) {
                // draw
                const offset = i * 12;
                const [lw, px, py, tvx, tvy, x, y, sx, sy, r, g, b] = render_array.slice(offset, offset + 12);
                const final_str = "rgb(" + r + "," + g + "," + b + ")";
                ctx.fillStyle = final_str;
                ctx.beginPath();
                ctx.strokeStyle = final_str;
                ctx.lineWidth = lw;
                ctx.moveTo(px, py);
                ctx.lineTo(px + tvx, py + tvy);
                ctx.stroke();
                ctx.fillRect(x, y, sx, sy);
        }

        requestAnimationFrame(() => draw(state, can, ctx));
}

function handle_background_grid(can, ctx, grid_spacing_px, grid_divisor, line_offset) {
        ctx.strokeStyle = "#404040";
        ctx.lineWidth = 1;

        for (let i = -1; i < can.height / grid_divisor; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i * grid_divisor + line_offset);
                ctx.lineTo(can.width, (i + 1) * grid_spacing_px + line_offset * (grid_spacing_px / grid_divisor));
                ctx.stroke();
        }

        for (let i = -1; i < can.width / grid_divisor; i++) {
                ctx.beginPath();
                ctx.moveTo(i * grid_divisor + line_offset, 0);
                ctx.lineTo((i + 1) * grid_spacing_px + line_offset * (grid_spacing_px / grid_divisor), can.height);
                ctx.stroke();
        }
}

export { draw };
