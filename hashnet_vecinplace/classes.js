class Vec2DInplace {
    constructor(x = 0, y = 0) {
        // isnan(x, y);
        this.x = x;
        this.y = y;
    }

    clone() {
        // isnan(this.x, this.y);
        return new Vec2DInplace(this.x, this.y);
    }

    set_inplace(x, y) {
        // isnan(this.x, this.y, x, y);
        this.x = x;
        this.y = y;
    }

    set_vec_inplace(other_vec) {
        // isnan(this.x, this.y, other_vec.x, other_vec.y);
        this.x = other_vec.x;
        this.y = other_vec.y;
    }

    add_inplace(x, y) {
        // isnan(this.x, this.y, x, y);
        this.x += x;
        this.y += y;
    }

    add_vec_inplace(other_vec) {
        // isnan(this.x, this.y, other_vec.x, other_vec.y);
        this.x += other_vec.x;
        this.y += other_vec.y;
    }

    scale_inplace(factor) {
        // isnan(this.x, this.y, factor);
        this.x *= factor;
        this.y *= factor;
    }

    scale_vec_inplace(other_vec) {
        // isnan(this.x, this.y, other_vec.x, other_vec.y);
        this.x *= other_vec.x;
        this.y *= other_vec.y;
    }

    normalize_inplace() {
        // isnan(this.x, this.y);
        let hypot = this.mag();
        if (hypot == 0) return;
        this.x /= hypot;
        this.y /= hypot;
    }

    mag() {
        // isnan(this.x, this.y);
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    square_inplace() {
        // isnan(this.x, this.y);
        let mag = this.mag();
        this.normalize_inplace();
        this.scale_inplace(mag);
    }

    to_inplace(other_vec) {
        // isnan(this.x, this.y, other_vec.x, other_vec.y);
        this.x = other_vec.x - this.x;
        this.y = other_vec.y - this.y;
    }

    from_inplace(other_vec) {
        // isnan(this.x, this.y, other_vec.x, other_vec.y);
        this.x = this.x - other_vec.x;
        this.y = this.y - other_vec.y;
    }

    neg_inplace() {
        // isnan(this.x, this.y);
        this.x = -this.x;
        this.y = -this.y;
    }

    one_over_d_sq_inplace(consume_target, unit_size) {
        // isnan(this.x, this.y, consume_target.x, consume_target.y, unit_size.x, unit_size.y);

        // console.log(
        //     "This:",
        //     this,
        //     this instanceof Vec2DInplace,
        //     "\nConsume Target:",
        //     consume_target,
        //     consume_target instanceof Vec2DInplace,
        //     "\nUnit Size:",
        //     unit_size,
        //     unit_size instanceof Vec2DInplace
        // );

        // let point_vec = this.scaleVec(unit_size).to(target.scaleVec(unit_size));
        this.scale_vec_inplace(unit_size);
        const tmp2 = consume_target;
        tmp2.scale_vec_inplace(unit_size);
        this.to_inplace(tmp2);

        // let direction = point_vec.normalize();
        // let mag = 1 / (point_vec.mag() ** 2 + 0.1);
        // return direction.scale(mag);

        const mag = 1 / (this.mag() ** 2 + 0.1);
        this.normalize_inplace();
        this.scale_inplace(mag);
    }

    divide(amount) {
        // isnan(this.x, this.y, amount);
        /** @type {Vec2DInplace[][]} */
        const vec_tuple_array = [];

        const unit = this.clone();
        unit.normalize_inplace();
        const magnitude = this.mag();
        unit.scale_inplace(magnitude / amount);

        for (let i = 0; i < amount; i++) {
            const start = unit.clone();
            start.scale_inplace(i);

            const end = start.clone();
            end.add_vec_inplace(unit);

            vec_tuple_array.push([start, end]);
        }

        return vec_tuple_array;
    }

    /**
     * @param {number} amount
     * @param {number} randomization_factor
     */
    divide_rand(amount, randomization_factor) {
        /** @type {Vec2DInplace[][]} */
        const vec_tuple_array = [];

        const direction = this.clone();
        direction.normalize_inplace();
        const magnitude = this.mag();

        const unit = direction.clone();
        unit.scale_inplace(magnitude / amount);

        for (let i = 0; i < amount; i++) {
            if (i === 0) {
                // const actual_start = i === 0 ? new Vec2D() : unit.scale(i);
                const actual_start = new Vec2DInplace();

                // const actual_end = actual_start.add(unit);
                const actual_end = actual_start.clone();
                actual_end.add_vec_inplace(unit);

                // const rand_start = i === 0 ? actual_start : vec_tuple_array[i - 1][3];

                const rand_start = actual_start.clone();
                // const rand_end =
                if (i === amount - 1) {
                    // actual_end
                    const rand_end = actual_end.clone();
                    vec_tuple_array.push([actual_start, actual_end, rand_start, rand_end]);
                    continue;
                } else {
                    // actual_end.add(direction.rotate(Math.PI / 2).scale(random(-1, 1) * randomization_factor))
                    const rand_end = actual_end.clone();
                    const tmp1 = direction.clone();
                    tmp1.rotate_inplace(Math.PI * 2);
                    tmp1.scale_inplace(random(-1, 1) * randomization_factor);
                    rand_end.add_vec_inplace(tmp1);
                    vec_tuple_array.push([actual_start, actual_end, rand_start, rand_end]);
                    continue;
                }
            } else {
                // const actual_start = i === 0 ? new Vec2D() : unit.scale(i);
                const actual_start = unit.clone();
                actual_start.scale_inplace(i);

                // const actual_end = actual_start.add(unit);
                const actual_end = actual_start.clone();
                actual_end.add_vec_inplace(unit);

                // will not be undefined because we are sure i is not 0, meaning i - 1 is always >= 0
                const rand_start = vec_tuple_array[i - 1][3].clone();

                if (i === amount - 1) {
                    // actual_end
                    const rand_end = actual_end.clone();
                    vec_tuple_array.push([actual_start, actual_end, rand_start, rand_end]);
                    continue;
                } else {
                    // const rand_end = i === amount - 1 ? actual_end : actual_end.add(direction.rotate(Math.PI / 2).scale(random(-1, 1) * randomization_factor));
                    const rand_end = actual_end.clone();
                    const tmp1 = direction.clone();
                    tmp1.rotate_inplace(Math.PI / 2);
                    tmp1.scale_inplace(random(-1, 1) * randomization_factor);
                    rand_end.add_vec_inplace(tmp1);
                    vec_tuple_array.push([actual_start, actual_end, rand_start, rand_end]);
                    continue;
                }
            }
        }

        return vec_tuple_array;
    }

    rotate_inplace(angle) {
        // isnan(this.x, this.y, angle);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;

        this.x = newX;
        this.y = newY;
    }

    arr() {
        // isnan(this.x, this.y);
        return [this.x, this.y];
    }
}

class Rigid {
    /**
     * @param {HTMLCanvasElement} parentCanvas
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vec2DInplace} size
     * @param {Vec2DInplace} pos
     * @param {Vec2DInplace} vel
     * @param {Vec2DInplace} acc
     * @param {string} style
     * @param {Vec2DInplace} target
     * @param {number} friction
     */
    constructor(
        parentCanvas,
        ctx,
        size = new Vec2DInplace(10, 10),
        pos = new Vec2DInplace(parentCanvas.width / 2, parentCanvas.height / 2),
        vel = new Vec2DInplace(0, 0),
        acc = new Vec2DInplace(0, 0),
        style = "rgb(255, 0, 0)",
        target = new Vec2DInplace(parentCanvas.width / 2, parentCanvas.height / 2),
        friction = 0.5
    ) {
        this.parentCanvas = parentCanvas;
        this.canvasOrigin = new Vec2DInplace(parentCanvas.width / 2, parentCanvas.height / 2);
        this.target = target;
        this.ctx = ctx;
        this.size = size;
        this.pos = pos;
        this.vel = vel;
        this.acc = acc;
        this.style = style;
        this.negstyle = negateColor(this.style);
        this.friction = friction;
    }

    update(dt, time, timeDilation, obliterated) {
        if (!obliterated) this.handle_ticks(dt, timeDilation);
        this.outline(time);
        this.draw(time);
    }

    handle_ticks(dt, timeDilation) {
        const threshold = 1 / 4096;
        while (dt > threshold) {
            this.physics_calc(threshold / timeDilation);
            if (clamping_behavior) this.border();
            dt -= threshold;
        }

        this.physics_calc(threshold);
    }

    draw(time) {
        const rgb = styleStringToRgb(this.style);
        const hsv = rgbToHsv(rgb);
        const interval = 600000;
        const rotateAmount = time / 1000 / (interval / 1000);
        const rotated = rotHue(hsv, rotateAmount * 360);
        const final_rgb = hsvToRgb(rotated);
        const final_str = rgbToStyleString(final_rgb);
        this.ctx.fillStyle = final_str;
        const [x, y, sizex, sizey] = squareAt(this.pos.x, this.pos.y, this.size.x, this.size.y);

        const trail_vec = this.vel.clone();
        trail_vec.normalize_inplace();
        const mag = this.vel.mag();
        trail_vec.scale_inplace(-mag / Math.sqrt(1000));

        this.ctx.beginPath();
        this.ctx.strokeStyle = final_str;
        this.ctx.lineWidth = this.size.mag() / Math.SQRT2;
        this.ctx.moveTo(this.pos.x, this.pos.y);
        this.ctx.lineTo(this.pos.x + trail_vec.x, this.pos.y + trail_vec.y);
        this.ctx.stroke();

        this.ctx.fillRect(x, y, sizex, sizey);
    }

    outline(time) {
        const rgb = styleStringToRgb(this.style);
        const hsv = rgbToHsv(rgb);
        const interval1 = 600000;
        const rotateAmount = time / interval1;
        const rotated = rotHue(hsv, rotateAmount * 360);
        const final_rgb = hsvToRgb(rotated);
        const final_str = rgbToStyleString(final_rgb);
        const interval2 = 1000 / 3;
        const seconds = time / 1000;
        const sinx = Math.sin((2000 * Math.PI * seconds) / interval2);
        const [min, max] = [1.2, 1.75];
        const [one, two, three, four] = squareAt(
            this.pos.x,
            this.pos.y,
            signedLerp(this.size.x * min, this.size.x * max, sinx),
            signedLerp(this.size.y * min, this.size.y * max, sinx)
        );
        const [sh1, sh2, sh3, sh4] = squareAt(
            this.pos.x,
            this.pos.y,
            signedLerp(this.size.x * min, this.size.x * max, sinx) + 10,
            signedLerp(this.size.y * min, this.size.y * max, sinx) + 10
        );
        this.ctx.fillStyle = "#00000030";
        this.ctx.fillRect(sh1, sh2, sh3, sh4);
        this.ctx.fillstyle = "#ffffffff";
        this.ctx.fillStyle = rgbToStyleString(hsvToRgb(clampLum(rotHue(rgbToHsv(styleStringToRgb(final_str)), 270), 0.4, 0.6)));
        this.ctx.fillRect(one, two, three, four);
    }

    physics_calc(dt) {
        // // this.acc.set(
        // //     this.pos
        // //       .oneOverDistanceSquared(
        // //         this.target,
        // //         new Vec2D(1 / this.parentCanvas.width, 1 / this.parentCanvas.width)
        // //       )
        // //       .scale(1000)
        // //   );
        const tmp1 = this.pos.clone();
        tmp1.one_over_d_sq_inplace(this.target.clone(), new Vec2DInplace(1 / this.parentCanvas.width, 1 / this.parentCanvas.width));
        tmp1.scale_inplace(1000);
        this.acc.set_vec_inplace(tmp1);

        // const tmp1 = this.pos.clone();
        // tmp1.to_inplace(this.target);
        // this.acc.set_vec_inplace(tmp1);

        // console.log(tmp1);

        // this.vel.set(this.vel.add(this.acc.scale(dt)));
        this.vel.add_inplace(this.acc.x * dt, this.acc.y * dt);

        // this.vel.set(this.vel.scale(this.friction ** dt));
        this.vel.scale_inplace(this.friction ** dt);

        // this.pos.set(this.pos.add(this.vel.scale(dt)));
        this.pos.add_inplace(this.vel.x * dt, this.vel.y * dt);
    }

    border() {
        const tl = new Vec2DInplace(0, 0);
        const br = new Vec2DInplace(this.parentCanvas.width, this.parentCanvas.height);

        if (this.pos.x <= tl.x || this.pos.x >= br.x) {
            this.vel.x = -this.vel.x;
        }

        if (this.pos.y <= tl.y || this.pos.y >= br.y) {
            this.vel.y = -this.vel.y;
        }

        if (this.pos.x < tl.x) {
            this.pos.x = tl.x;
        }

        if (this.pos.x > br.x) {
            this.pos.x = br.x;
        }

        if (this.pos.y < tl.y) {
            this.pos.y = tl.y;
        }

        if (this.pos.y > br.y) {
            this.pos.y = br.y;
        }
    }
}
