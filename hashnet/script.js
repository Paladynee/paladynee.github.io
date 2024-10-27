/** @format */

function getMouseVel(newPos, dt) {
  if (dt <= 0) return;
  last_mousePos.push(new Vec2D(newPos.x, newPos.y));
  if (last_mousePos.length > 360) last_mousePos.shift();

  let sum = 0;
  const conditional = Math.min(last_mousePos.length, Math.floor(0.25 / dt)) - 1;
  if (!last_mousePos.find((a) => a.mag() > 0)) return;

  // console.log(conditional);
  let final_divisor = 0;
  for (let i = 0; i < conditional; i++) {
    let mag = last_mousePos[i].from(last_mousePos[i + 1]).mag();
    if (mag === 0) {
    } else {
      sum += (mag * 1000) / dt;
      final_divisor += 1;
    }
  }
  sum /= final_divisor;

  // console.log(sum);
}

function draw() {
  handleContinuousStrokes(held_keys);

  ctx.clearRect(0, 0, can.width, can.height);

  let now = performance.now();
  let dt = (now - time) / 1000;
  time = now;

  // getMouseVel(mousePos, dt);

  if (dt > 0.1) dt = 0.1;
  if (dt <= 0) dt = 0.001;

  let grid_spacing_px = 50;
  let grid_divisor = 50;

  ctx.strokeStyle = "#404040";
  ctx.lineWidth = 1;

  for (let i = -1; i < can.height / grid_divisor; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * grid_divisor + line_offset);
    ctx.lineTo(
      can.width,
      (i + 1) * grid_spacing_px + line_offset * (grid_spacing_px / grid_divisor)
    );
    ctx.stroke();
  }

  for (let i = -1; i < can.width / grid_divisor; i++) {
    ctx.beginPath();
    ctx.moveTo(i * grid_divisor + line_offset, 0);
    ctx.lineTo(
      (i + 1) * grid_spacing_px +
        line_offset * (grid_spacing_px / grid_divisor),
      can.height
    );
    ctx.stroke();
  }

  if (!obliterated) line_offset = (line_offset + 0.5 + dt * 100) % grid_divisor;

  for (let i = 0; i < objects.length; i++) {
    objects[i].update(dt, time, timeDilation, obliterated);
  }

  // draw a line to the closest fucking thing(s)

  let nearmap = objects.sort(
    (a, b) => a.pos.to(mousePos).mag() - b.pos.to(mousePos).mag()
  );

  let near_hashnet = nearmap.slice(0, hashnet_size);

  let pointArray = near_hashnet.map((obj) => obj.pos.arr());

  let u32array = [];
  pointArray.forEach((sig) => sig.forEach((term) => u32array.push(term)));

  let laundry = new Delaunator(u32array);

  let lines = [];
  for (let i = 0; i < laundry.triangles.length; i += 3) {
    let point_1 = pointArray[laundry.triangles[i]];
    let point_2 = pointArray[laundry.triangles[i + 1]];
    let point_3 = pointArray[laundry.triangles[i + 2]];
    let line1 = [point_1, point_2];
    let line2 = [point_2, point_3];
    let line3 = [point_3, point_1];
    lines.push(line1, line2, line3);
  }

  ctx.lineWidth = 2;

  let next = 0;
  for (let i = 0; i < lines.length; i++) {
    let [from, to] = lines[i];
    ctx.beginPath();
    ctx.strokeStyle = palette[next];
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.stroke();
    next = (next + 1) % palette.length;
  }

  // let depth = 25;

  let currentSubject = nearmap[nearmap.length - 1];
  next = 0;

  for (let i = 0; i < hashnet_size; i++) {
    let nextSubject = nearmap[nearmap.length - Math.floor(random(0, 10)) - 1];

    ctx.beginPath();
    ctx.strokeStyle = antipalette[next];
    ctx.lineWidth = 2;
    ctx.moveTo(currentSubject.x, currentSubject.y);
    ctx.lineTo(nextSubject.pos.x, nextSubject.pos.y);
    ctx.stroke();

    currentSubject = nextSubject.pos;
    next = (next + 1) % palette.length;
  }

  let subject = nearmap.reverse()[0];
  let line_length = 100;
  let diff = mousePos.to(subject.pos);
  for (let lasers = 0; lasers < 5; lasers++) {
    let result = diff.divide_rand(
      ~~(diff.mag() / line_length) + 2,
      Math.sqrt(diff.mag() * 10)
    );

    if (result.length > 100) break;

    for (const [pred, succ, start, end] of result) {
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#000000";
      ctx.moveTo(mousePos.x + start.x, mousePos.y + start.y);
      ctx.lineTo(mousePos.x + end.x, mousePos.y + end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#40ff40";
      ctx.moveTo(mousePos.x + pred.x, mousePos.y + pred.y);
      ctx.lineTo(mousePos.x + succ.x, mousePos.y + succ.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = "#ff0000";
      ctx.arc(
        mousePos.x + pred.x,
        mousePos.y + pred.y,
        2,
        0,
        2 * Math.PI,
        false
      );
      ctx.fill();
    }

    for (const [pred, succ, start, end] of result) {
      ctx.beginPath();
      ctx.fillStyle = "#444";
      ctx.arc(mousePos.x + end.x, mousePos.y + end.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  nearmap.reverse();

  requestAnimationFrame(draw);
}

/**
 * @type {HTMLCanvasElement}
 */
let can = document.querySelector("canvas");
/**
 * @type {CanvasRenderingContext2D}
 */
let ctx = can.getContext("2d");
resize();
window.addEventListener("resize", resize);

let lastColor = 0;
let mousePos = new Vec2D(can.width / 2, can.height / 2);
window.addEventListener("mousemove", (e) => {
  if (!mouse_prevent) mousePos.set(new Vec2D(e.clientX, e.clientY));
});
let last_mousePos = [];

let helpmenu = true;
let obliterated = false;
let mouse_prevent = false;
let line_offset = 0;
let hashnet_size = 18;
let objectAmount = 1000;
let objects = initObjects(objectAmount);
let timeDilation = 3;
let paletteHue = random(0, 360);
let palette = generateHsvLumPalette(objects.length, 1, paletteHue)
  .map(hsvToRgb)
  .map(rgbToStyleString);
let antipalette = generateHsvLumPalette(
  objects.length,
  1,
  (paletteHue + 180) % 360
)
  .map(hsvToRgb)
  .map(rgbToStyleString);
let held_keys = new Set();
let clamping_behavior = true;

// let logged = false;

window.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    for (let i = 0; i < objects.length; i++) {
      let dist = objects[i].pos.from(objects[i].target).mag();
      let direction = objects[i].pos.from(objects[i].target).normalize();
      if (direction.mag() === 0) {
        direction = new Vec2D(1, 0).rotate(random(0, Math.PI * 2));
      }
      let pow = 1000000 / (dist + 100) / 2;
      objects[i].vel.set(objects[i].vel.add(direction.scale(pow)));
    }
  } else {
    for (let i = 0; i < objects.length; i++) {
      let dist = objects[i].pos.to(objects[i].target).mag();
      let direction = objects[i].pos.to(objects[i].target).normalize();
      let pow = 5 * dist;
      objects[i].vel.set(direction.scale(pow));
    }
  }
});

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

window.addEventListener("keydown", (e) => {
  held_keys.add(e.key);
  handleStroke(e);
});

window.addEventListener("keyup", (e) => {
  e.preventDefault();
  held_keys.delete(e.key);
});

window.addEventListener("wheel", (e) => {
  if (e.deltaY > 0) {
    timeDilation *= 3 ** 0.5;
    if (timeDilation > 2187) timeDilation = 2187;
  } else {
    timeDilation /= 3 ** 0.5;
    if (timeDilation < 1) timeDilation = 1;
  }
});

// setTimeout(() => {
//   logged = true;
// }, 2000);
let time = performance.now();
draw();
