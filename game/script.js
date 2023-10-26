/** @format */

function draw() {
  ctx.clearRect(0, 0, can.width, can.height);

  let now = performance.now();
  let dt = (now - time) / 1000;
  time = now;

  if (dt > 0.1) dt = 0.1;

  let grid_spacing_px = 100;
  let grid_divisor = 100;

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

  line_offset = (line_offset + dt * 25) % grid_divisor;

  dt /= timeDilation;

  for (let i = 0; i < objects.length; i++) {
    objects[i].update(dt, time);
  }

  // draw a line to the closest fucking thing(s)

  let nearmap = objects.sort(
    (a, b) => a.pos.to(mousePos).mag() - b.pos.to(mousePos).mag()
  );
  // sortColors();

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
    ctx.strokeStyle = palette[next];
    ctx.beginPath();
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

  requestAnimationFrame(draw);
}

let can = document.querySelector("canvas");
let ctx = can.getContext("2d");
resize();
window.addEventListener("resize", resize);

let lastColor = 0;
let mousePos = new Vec2D(can.width / 2, can.height / 2);
window.addEventListener("mousemove", (e) => {
  mousePos.set(new Vec2D(e.clientX, e.clientY));
});

let helpmenu = true;
let line_offset = 0;
let hashnet_size = 18;
let objectAmount = 100;
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

// let logged = false;

window.addEventListener("mousedown", (e) => {
  for (let i = 0; i < objects.length; i++) {
    let dist = objects[i].pos.from(mousePos);
    let pow = 1000000 / (dist.mag() + 100);
    // console.log(pow);
    objects[i].vel.set(
      objects[i].vel.add(
        objects[i].pos.from(objects[i].target).normalize().mult1D(pow)
      )
    );
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key != "+" && e.key != "-" && e.key != "Escape") {
    resetColors();
  } else {
    if (e.key == "+") {
      hashnet_size += 3;
      if (hashnet_size >= objects.length) hashnet_size = objects.length;
    }
    if (e.key == "-") {
      hashnet_size -= 3;
      if (hashnet_size < 0) hashnet_size = 0;
    }
    if (e.key == "Escape") {
      helpmenu
        ? (document.querySelector(".info").style = "display: none")
        : (document.querySelector(".info").style = "display: block");
      helpmenu = !helpmenu;
    }
  }
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
