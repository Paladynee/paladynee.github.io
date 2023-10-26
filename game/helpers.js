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
  if (!str.startsWith("rgb(")) {
    return str;
  }

  // console.log(str);

  const values = str.match(/\d+/g).map(Number);
  return { r: values[0], g: values[1], b: values[2] };
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
    final.push(
      new Rigid({
        parentCanvas: can,
        ctx: ctx,
        style: rgbToStyleString(hsvToRgb(colors[i])), //randomColor(),
        pos: new Vec2D(random(0, can.width), random(0, can.height)),
        target: mousePos,
      })
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
  let newPalette = generateHsvLumPalette(100, 1, (Math.random() * 360) % 360);
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
