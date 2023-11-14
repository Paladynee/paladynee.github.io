class Vec2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * @param {Vec2D} vec
   */
  set(vec) {
    this.x = vec.x;
    this.y = vec.y;
  }

  /**
   * @param {Vec2D} vec
   */
  add(vec) {
    return new Vec2D(this.x + vec.x, this.y + vec.y);
  }

  /**
   * @param {number} factor
   */
  scale(factor) {
    return new Vec2D(this.x * factor, this.y * factor);
  }

  /**
   * @param {Vec2D} vec
   */
  scaleVec(vec) {
    return new Vec2D(this.x * vec.x, this.y * vec.y);
  }

  normalize() {
    let hypot = this.mag();
    if (hypot == 0) return new Vec2D(0, 0);
    return new Vec2D(this.x / hypot, this.y / hypot);
  }

  square() {
    let direction = this.normalize();
    let mag = this.mag() ** 2;
    return direction.scale(mag);
  }

  /**
   * @param {Vec2D} target
   * @param {Vec2D} unit_size
   */
  oneOverDistanceSquared(target, unit_size) {
    let point_vec = this.scaleVec(unit_size).to(target.scaleVec(unit_size));
    let direction = point_vec.normalize();
    let mag = 1 / (point_vec.mag() ** 2 + 0.1);
    return direction.scale(mag);
  }

  mag() {
    let mag = Math.sqrt(this.x * this.x + this.y * this.y);
    return mag == 0 ? 0 : mag;
  }

  /**
   * @param {Vec2D} vec
   */
  to(vec) {
    return new Vec2D(vec.x - this.x, vec.y - this.y);
  }

  /**
   * @param {Vec2D} vec
   */
  from(vec) {
    return new Vec2D(this.x - vec.x, this.y - vec.y);
  }

  /**
   * @param {(component: number) => number} fn
   */
  map(fn) {
    return new Vec2D(fn(this.x), fn(this.y));
  }

  copy() {
    return new Vec2D(this.x, this.y);
  }

  arr() {
    return [this.x, this.y];
  }

  /**
   * @param {number} amount
   */
  divide(amount) {
    /** @type {Vec2D[][]} */
    const vec_tuple_array = [];

    const direc = this.normalize();
    const magnitude = this.mag();

    const unit = direc.scale(magnitude / amount);

    for (let i = 0; i < amount; i++) {
      const start = unit.scale(i);
      const end = start.add(unit);

      vec_tuple_array.push([start, end]);
    }

    return vec_tuple_array;
  }

  /**
   * @param {number} amount
   * @param {number} randomization_factor
   */
  divide_rand(amount, randomization_factor) {
    /** @type {Vec2D[][]} */
    const vec_tuple_array = [];

    const direction = this.normalize();
    const magnitude = this.mag();

    const unit = direction.scale(magnitude / amount);

    for (let i = 0; i < amount; i++) {
      const actual_start = i === 0 ? new Vec2D() : unit.scale(i);
      const actual_end = actual_start.add(unit);

      const rand_start = i === 0 ? actual_start : vec_tuple_array[i - 1][3];
      const rand_end =
        i === amount - 1
          ? actual_end
          : actual_end.add(
              direction
                .rotate(Math.PI / 2)
                .scale(random(-1, 1) * randomization_factor)
            );

      vec_tuple_array.push([actual_start, actual_end, rand_start, rand_end]);
    }

    return vec_tuple_array;
  }

  /**
   * @param {number} angle
   */
  rotate(angle) {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    const newX = this.x * cosAngle - this.y * sinAngle;
    const newY = this.x * sinAngle + this.y * cosAngle;

    return new Vec2D(newX, newY);
  }
}

class Rigid {
  /**
   * @param {HTMLCanvasElement} parentCanvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {Vec2D} size
   * @param {Vec2D} pos
   * @param {Vec2D} vel
   * @param {Vec2D} acc
   * @param {string} style
   * @param {Vec2D} target
   * @param {number} friction
   */
  constructor(
    parentCanvas,
    ctx,
    size = new Vec2D(10, 10),
    pos = new Vec2D(parentCanvas.width / 2, parentCanvas.height / 2),
    vel = new Vec2D(0, 0),
    acc = new Vec2D(0, 0),
    style = "rgb(255, 0, 0)",
    target = new Vec2D(parentCanvas.width / 2, parentCanvas.height / 2),
    friction = 0.5
  ) {
    this.parentCanvas = parentCanvas;
    this.canvasOrigin = new Vec2D(
      parentCanvas.width / 2,
      parentCanvas.height / 2
    );
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
    let threshold = 1 / 4096;
    while (dt > threshold) {
      this.physics_calc(threshold / timeDilation);
      if (clamping_behavior) this.border();
      dt -= threshold;
    }

    this.physics_calc(threshold);
  }

  draw(time) {
    let rgb = styleStringToRgb(this.style);
    let hsv = rgbToHsv(rgb);
    let interval = 600000;
    let rotateAmount = time / 1000 / (interval / 1000);
    let rotated = rotHue(hsv, rotateAmount * 360);
    let final_rgb = hsvToRgb(rotated);
    let final_str = rgbToStyleString(final_rgb);
    this.ctx.fillStyle = final_str;
    let [x, y, sizex, sizey] = squareAt(
      this.pos.x,
      this.pos.y,
      this.size.x,
      this.size.y
    );

    let direction = this.vel.normalize();
    let mag = this.vel.mag();
    let trail_vec = direction.scale(-mag / Math.sqrt(1000));

    this.ctx.beginPath();
    this.ctx.strokeStyle = final_str;
    this.ctx.lineWidth = this.size.mag() / Math.SQRT2;
    this.ctx.moveTo(this.pos.x, this.pos.y);
    this.ctx.lineTo(this.pos.x + trail_vec.x, this.pos.y + trail_vec.y);
    this.ctx.stroke();

    this.ctx.fillRect(x, y, sizex, sizey);
  }

  outline(time) {
    let rgb = styleStringToRgb(this.style);
    let hsv = rgbToHsv(rgb);
    let interval1 = 600000;
    let rotateAmount = time / 1000 / (interval1 / 1000);
    let rotated = rotHue(hsv, rotateAmount * 360);
    let final_rgb = hsvToRgb(rotated);
    let final_str = rgbToStyleString(final_rgb);
    let interval2 = 333.333333333;
    let seconds = time / 1000;
    let sinx = Math.sin(((Math.PI * seconds) / (interval2 / 1000)) * 2);
    let [min, max] = [1.2, 1.75];
    let [one, two, three, four] = squareAt(
      this.pos.x,
      this.pos.y,
      signedLerp(this.size.x * min, this.size.x * max, sinx),
      signedLerp(this.size.y * min, this.size.y * max, sinx)
    );
    this.ctx.fillStyle = rgbToStyleString(
      hsvToRgb(
        clampLum(rotHue(rgbToHsv(styleStringToRgb(final_str)), 270), 0.4, 0.6)
      )
    );
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "#000000";
    this.ctx.fillRect(one, two, three, four);
    this.ctx.shadowBlur = 0;
  }

  physics_calc(dt) {
    this.acc.set(
      this.pos
        .oneOverDistanceSquared(
          this.target,
          new Vec2D(1 / this.parentCanvas.width, 1 / this.parentCanvas.width)
        )
        .scale(1000)
    );
    this.vel.set(this.vel.add(this.acc.scale(dt)));
    this.vel.set(this.vel.scale(this.friction ** dt));
    this.pos.set(this.pos.add(this.vel.scale(dt)));
    // this.pos
    //   .to(this.target)
    //   .mult1D(10)
    //   .add(new Vec2D(random(-5000, 5000), random(-5000, 5000)))
    //   .add(this.pos.to(this.target).normalize().mult1D(5000))
  }

  border() {
    let tl = new Vec2D(0, 0);
    let br = new Vec2D(this.parentCanvas.width, this.parentCanvas.height);

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
