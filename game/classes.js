/** @format */

class Vec2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(vec) {
    this.x = vec.x;
    this.y = vec.y;
  }

  add(vec) {
    return new Vec2D(this.x + vec.x, this.y + vec.y);
  }

  mult1D(factor) {
    return new Vec2D(this.x * factor, this.y * factor);
  }

  normalize() {
    let hypot = this.mag();
    if (hypot == 0) return new Vec2D(0, 0);
    return new Vec2D(this.x / hypot, this.y / hypot);
  }

  mag() {
    let mag = Math.sqrt(this.x * this.x + this.y * this.y);
    return mag == 0 ? 0 : mag;
  }

  to(vec) {
    return new Vec2D(vec.x - this.x, vec.y - this.y);
  }

  from(vec) {
    return new Vec2D(this.x - vec.x, this.y - vec.y);
  }

  copy() {
    return new Vec2D(this.x, this.y);
  }

  arr() {
    return [this.x, this.y];
  }
}

class Rigid {
  constructor({
    parentCanvas,
    ctx,
    size = new Vec2D(10, 10),
    pos = new Vec2D(parentCanvas.width / 2, parentCanvas.height / 2),
    vel = new Vec2D(0, 0),
    acc = new Vec2D(0, 0),
    style = "rgb(255, 0, 0)",
    target = new Vec2D(parentCanvas.width / 2, parentCanvas.height / 2),
    friction = 0.5,
  }) {
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

  update(dt, time) {
    this.physics(dt);
    this.border();
    this.outline(time);
    this.draw(time);
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
    this.ctx.fillRect(one, two, three, four);
  }

  physics(dt) {
    // first acc, then vel, then pos
    this.acc.set(this.pos.to(this.target).normalize().mult1D(10000));
    this.vel.set(this.vel.add(this.acc.mult1D(dt)));
    this.vel.set(this.vel.mult1D(this.friction ** dt));
    this.pos.set(this.pos.add(this.vel.mult1D(dt)));
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
