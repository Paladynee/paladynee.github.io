/** @format */

function random(from, to) {
  return Math.random() * (to - from) + from;
}

function randomColor() {
  return rgbToStyleString(generateRandomRgb());
}

function generateRandomRgb() {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return { r, g, b };
}

function rgbToStyleString({ r, g, b }) {
  return `rgb(${r},${g},${b})`;
}

function rgbToHsv({ r, g, b }) {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, v;

  const delta = max - min;

  // Calculate Hue
  if (delta === 0) {
    h = 0;
  } else if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  h = (h * 60 + 360) % 360;

  // Calculate Saturation
  s = max === 0 ? 0 : delta / max;

  // Calculate Value
  v = max;

  return { h, s, v };
}

function hsvToRgb({ h, s, v }) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r, g, b;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rotHue({ h, s, v }, amount) {
  // Ensure hue is within the range [0, 360)
  let newHue = (h + amount) % 360;

  // Handle negative hue values
  while (newHue < 0) {
    newHue = 360 + newHue;
  }

  return { h: newHue, s, v };
}

function generateHsvLumPalette(size, saturation, hue) {
  if (size <= 0) {
    return [];
  }

  const stepSize = 1 / size;
  const palette = [];

  for (let i = 0; i < size; i++) {
    const luminosity = 1 - i * stepSize;
    palette.push({ h: hue, s: saturation, v: luminosity });
  }

  return palette;
}

function generateHsvHuePalette(size, saturation, luminosity) {
  const palette = [];
  const hueIncrement = 360 / size;
  for (let i = 0; i < size; i++) {
    const hue = (i * hueIncrement) % 360;
    palette.push({ h: hue, s: saturation, v: luminosity });
  }
  return palette;
}

function signedLerp(min, max, t) {
  t = (t + 1) / 2;
  let finalT = Math.pow(t, 3);
  return min + finalT * (max - min);
}

function resize() {
  can.width = innerWidth;
  can.height = innerHeight;
}

function squareAt(posx, posy, sizex, sizey) {
  return [posx - sizex / 2, posy - sizey / 2, sizex, sizey];
}

function negateColor(inputString) {
  if (!inputString.startsWith("rgb(")) {
    return inputString;
  }

  const values = inputString
    .match(/\d+/g)
    .map(Number)
    .map((value) => 255 - value);

  return `rgb(${values.join(",")})`;
}

function clampLum({ h, s, v }, min, max) {
  // Ensure v is within the specified range [min, max]
  const clampedV = Math.max(min, Math.min(max, v));

  return { h, s, v: clampedV };
}

function styleStringToRgb(str) {
  if (str.length < 10 || str.length > 16 || str.substring(0, 4) !== "rgb(") {
    return str;
  }

  let comma1 = str.indexOf(",");
  let comma2 = str.indexOf(",", comma1 + 1);

  if (comma1 === -1 || comma2 === -1) {
    return str;
  }

  const r = parseInt(str.substring(4, comma1));
  const g = parseInt(str.substring(comma1 + 1, comma2));
  const b = parseInt(str.substring(comma2 + 1, str.length - 1));

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return str;
  }

  return { r, g, b };
}

function initObjects(objamount = 100) {
  let final = [];
  let colors = generateHsvLumPalette(
    objectAmount,
    1,
    (Math.random() * 360) % 360
  );
  // let colors = generateHsvHuePalette(objamount, 0.6, 1);
  // console.log(colors);

  for (let i = 0; i < objamount; i++) {
    let color = rgbToStyleString(hsvToRgb(colors[i])); //randomColor(),
    let pos = new Vec2D(random(0, can.width), random(0, can.height));
    final.push(
      new Rigid(
        can,
        ctx,
        new Vec2D(10, 10),
        pos,
        undefined,
        undefined,
        color,
        mousePos,
        undefined
      )
    );
  }
  return final;
}

function resetObjects() {
  let amount = objects.length;
  objects = initObjects(amount);
}

function sortColors() {
  objects.map((obj, i) => {
    obj.style = palette[i];
  });
}

function resetColors() {
  let newPalette = generateHsvLumPalette(objectAmount, 1, (Math.random() * 360) % 360);
  objects.map((obj, i) => {
    obj.style = rgbToStyleString(hsvToRgb(newPalette[i]));
  });
  paletteHue = random(0, 360);
  palette = generateHsvLumPalette(objects.length, 1, paletteHue)
    .map(hsvToRgb)
    .map(rgbToStyleString);
  antipalette = generateHsvLumPalette(
    objects.length,
    1,
    (paletteHue + 180) % 360
  )
    .map(hsvToRgb)
    .map(rgbToStyleString);
}

function handleStroke(event) {
  let key = event.key;
  let prevent_keys = [
    "+",
    "-",
    "Tab",
    "Escape",
    "z",
    "Z",
    "q",
    "Q",
    "x",
    "X",
    "r",
    "R",
    "0",
    "5",
  ];

  if (prevent_keys.includes(key)) event.preventDefault();
  switch (key) {
    case "+":
      hashnet_size += 3;
      if (hashnet_size >= objects.length) hashnet_size = objects.length;
      break;
    case "-":
      hashnet_size -= 3;
      if (hashnet_size < 0) hashnet_size = 0;
      break;
    case "Tab":
      helpmenu
        ? (document.querySelector(".info").style = "display: none")
        : (document.querySelector(".info").style = "display: block");
      helpmenu = !helpmenu;
      break;
    case "Escape":
      obliterated = !obliterated;
      break;
    case "x":
    case "X":
      objects.forEach((obj) => {
        let remainder = 1 - obj.friction;
        if (remainder >= 1 || remainder <= 0) {
          obj.friction = 0.5;
        } else {
          obj.friction += remainder / 2;
        }
      });
      break;
    case "q":
    case "Q":
      objects.forEach((obj) => {
        obj.friction = 0.5;
      });
      break;
    case "z":
    case "Z":
      objects.forEach((obj) => {
        let remainder = 1 - obj.friction;
        if (obj.friction <= 3 / 4) {
          obj.friction /= 2;
        } else {
          obj.friction -= remainder * 2;
        }

        if (obj.friction >= 1 || obj.friction <= 0) {
          obj.friction = 0.5;
        }
      });
      break;
    case "5":
      mouse_prevent = !mouse_prevent;
      break;
    case "r":
    case "R":
      resetColors();
      break;
    case "0":
      clamping_behavior = !clamping_behavior;

    default:
      break;
  }
}

/**
 * @param {Set} key_list
 */
function handleContinuousStrokes(key_list) {
  let movement_strength = 10;
  for (const key of key_list) {
    // console.log(key);
    switch (key) {
      case "a":
      case "A":
        objects.forEach((obj) => {
          let angle = random(0, Math.PI * 2);
          let scale = obj.pos.to(obj.target).mag() * 4;
          let noise = new Vec2D(
            Math.cos(angle) * scale,
            Math.sin(angle) * scale
          );
          obj.vel.set(obj.pos.to(obj.target.add(noise)).scale(3));
        });
        break;
      case "s":
      case "S":
        objects.forEach((obj) => obj.vel.set(new Vec2D()));
        break;
      case "p":
      case "P":
        objects.forEach((obj) => {
          let angle = random(0, Math.PI * 2);
          obj.vel.set(new Vec2D(Math.cos(angle), Math.sin(angle)).scale(5000));
        });
        break;
      case "t":
      case "T":
        objects.forEach((obj) => {
          obj.pos.set(obj.pos.add(new Vec2D(-movement_strength, 0)));
        });
        break;
      case "y":
      case "Y":
        objects.forEach((obj) => {
          obj.pos.set(obj.pos.add(new Vec2D(movement_strength, 0)));
        });
        break;
      case "g":
      case "G":
        objects.forEach((obj) => {
          obj.pos.set(obj.pos.add(new Vec2D(0, movement_strength)));
        });
        break;
      case "h":
      case "H":
        objects.forEach((obj) => {
          obj.pos.set(obj.pos.add(new Vec2D(0, -movement_strength)));
        });
        break;
      case "f":
      case "F":
        objects.forEach((obj) => {
          let angle = random(0, Math.PI * 2);
          obj.pos.set(
            obj.pos.add(
              new Vec2D(Math.cos(angle), Math.sin(angle)).scale(
                movement_strength * 2
              )
            )
          );
        });
        break;
      case "c":
      case "C":
        objects.forEach((obj) => {
          obj.pos.set(mousePos);
        });
        break;
      case "o":
      case "O":
        objects.forEach((obj) => {
          obj.vel.set(
            obj.pos
              .to(mousePos)
              .rotate(Math.PI / 2)
              .normalize()
              .scale(obj.vel.mag())
          );
        });
        break;
      case "l":
      case "L":
        objects.forEach((obj) => {
          obj.vel.set(
            obj.pos
              .to(mousePos)
              .rotate(-Math.PI / 2)
              .normalize()
              .scale(obj.vel.mag())
          );
        });
        break;
      case "e":
      case "E":
        let shift_vector = objects
          .reduce((acc, val) => acc.add(val.pos), new Vec2D())
          .scale(1 / objects.length)
          .to(mousePos);

        objects.forEach((obj) => {
          obj.pos.set(obj.pos.add(shift_vector));
        });
        break;

      case "u":
      case "U":
        const radius = 100;
        let relative_circle_vec = new Vec2D(0, radius);
        let angle = (Math.PI * 2) / objects.length;

        const new_objects = [];

        for (let i in objects) {
          let obj = objects[i];
          obj.pos.set(mousePos.add(relative_circle_vec));
          obj.vel.set(obj.pos.to(mousePos).rotate(90).scale(10));
          relative_circle_vec.set(relative_circle_vec.rotate(angle));
          new_objects.push(obj);
        }

        objects = new_objects;

        break;

      default:
        break;
    }
  }
}

function boundary_check(vec, tl, br) {
  return vec.x < tl.x || vec.x > br.x || vec.y < tl.y || vec.y > br.y;
}

function find_closest() {
  let closest = objects[0];
  objects.forEach((obj) => {
    if (mousePos.to(closest.pos).mag() > mousePos.to(obj.pos)) {
      closest = obj;
    }
  });
  return closest;
}
