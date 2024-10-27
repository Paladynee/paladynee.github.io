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
    let str = "rgb(";
    str += r;
    str += ",";
    str += g;
    str += ",";
    str += b;
    str += ")";
    return str;
}

function rgbToHsv({ r, g, b }) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v;

    const delta = max - min;

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

    s = max === 0 ? 0 : delta / max;

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
    const finalT = Math.pow(t, 3);
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

function init_objects(objamount = 100) {
    const final = [];
    const colors = generateHsvLumPalette(objectAmount, 1, (Math.random() * 360) % 360);
    // let colors = generateHsvHuePalette(objamount, 0.6, 1);
    // console.log(colors);

    for (let i = 0; i < objamount; i++) {
        const color = rgbToStyleString(hsvToRgb(colors[i])); //randomColor(),
        const pos = new Vec2DInplace(random(0, can.width), random(0, can.height));
        const new_rigid = new Rigid(can, ctx, new Vec2DInplace(10, 10), pos, undefined, undefined, color, mousePos, undefined);
        // console.log("Rigid:", new_rigid);
        final.push(new_rigid);
    }
    return final;
}

function resetObjects() {
    let amount = objects.length;
    objects = init_objects(amount);
}

function sortColors() {
    for (const i in objects) {
        objects[i].style = palette[i];
    }
}

function resetColors() {
    const newPalette = generateHsvLumPalette(objectAmount, 1, (Math.random() * 360) % 360);
    for (const i in objects) {
        objects[i].style = rgbToStyleString(hsvToRgb(newPalette[i]));
    }
    paletteHue = random(0, 360);
    palette = generateHsvLumPalette(objects.length, 1, paletteHue).map(hsvToRgb).map(rgbToStyleString);
    antipalette = generateHsvLumPalette(objects.length, 1, (paletteHue + 180) % 360)
        .map(hsvToRgb)
        .map(rgbToStyleString);
}

function handleStroke(event) {
    let key = event.key;
    let prevent_keys = ["+", "-", "Tab", "Escape", "z", "Z", "q", "Q", "x", "X", "r", "R", "0", "5"];

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
            helpmenu ? (document.querySelector(".info").style = "display: none") : (document.querySelector(".info").style = "display: block");
            helpmenu = !helpmenu;
            break;
        case "Escape":
            obliterated = !obliterated;
            break;
        case "x":
        case "X":
            for (const obj of objects) {
                const remainder = 1 - obj.friction;
                if (remainder >= 1 || remainder <= 0) {
                    obj.friction = 0.5;
                } else {
                    obj.friction += remainder / 2;
                }
            }
            break;
        case "q":
        case "Q":
            for (const obj of objects) {
                obj.friction = 0.5;
            }
            break;
        case "z":
        case "Z":
            for (const obj of objects) {
                let remainder = 1 - obj.friction;
                if (obj.friction <= 3 / 4) {
                    obj.friction /= 2;
                } else {
                    obj.friction -= remainder * 2;
                }

                if (obj.friction >= 1 || obj.friction <= 0) {
                    obj.friction = 0.5;
                }
            }
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
                for (const obj of objects) {
                    const angle = random(0, Math.PI * 2);
                    const tmp1 = obj.pos.clone();
                    tmp1.to_inplace(obj.target);
                    const scale = tmp1.mag() * 4;

                    const noise_x = Math.cos(angle) * scale;
                    const noise_y = Math.sin(angle) * scale;

                    const target_offset = obj.target.clone();
                    target_offset.add_inplace(noise_x, noise_y);

                    const final_set_vec = obj.pos.clone();
                    final_set_vec.to_inplace(target_offset);

                    final_set_vec.scale_inplace(3);

                    obj.vel.set_vec_inplace(final_set_vec);

                    // let angle = random(0, Math.PI * 2);
                    // let scale = obj.pos.to(obj.target).mag() * 4;
                    // let noise = new Vec2DInplace(Math.cos(angle) * scale, Math.sin(angle) * scale);
                    // obj.vel.set(
                    //   obj.pos.to(
                    //     obj.target.add(noise)
                    //   ).scale(3)
                    // );
                }
                break;
            case "s":
            case "S":
                for (const obj of objects) {
                    obj.vel.set_inplace(0, 0);
                }
                break;
            case "p":
            case "P":
                for (const obj of objects) {
                    let angle = random(0, Math.PI * 2);
                    const tmp1 = new Vec2DInplace(Math.cos(angle), Math.sin(angle));
                    tmp1.scale_inplace(5000);
                    obj.vel.set_vec_inplace(tmp1);
                }
                break;
            case "t":
            case "T":
                for (const obj of objects) {
                    obj.pos.add_inplace(-movement_strength, 0);
                }
                break;
            case "y":
            case "Y":
                for (const obj of objects) {
                    obj.pos.add_inplace(movement_strength, 0);
                }
                break;
            case "g":
            case "G":
                for (const obj of objects) {
                    obj.pos.add_inplace(0, movement_strength);
                }
                break;
            case "h":
            case "H":
                for (const obj of objects) {
                    obj.pos.add_inplace(0, -movement_strength);
                }
                break;
            case "f":
            case "F":
                for (const obj of objects) {
                    const angle = random(0, Math.PI * 2);
                    const tmp1 = new Vec2DInplace(Math.cos(angle), Math.sin(angle));
                    tmp1.scale_inplace(movement_strength * 2);
                    obj.pos.add_vec_inplace(tmp1);
                }
                break;
            case "c":
            case "C":
                for (const obj of objects) {
                    obj.pos.set_vec_inplace(mousePos);
                }
                break;
            case "o":
            case "O":
                for (const obj of objects) {
                    const tmp1 = obj.pos.clone();
                    tmp1.to_inplace(mousePos);
                    tmp1.rotate_inplace(Math.PI / 2);
                    tmp1.normalize_inplace();
                    tmp1.scale_inplace(obj.vel.mag());

                    obj.vel.set_vec_inplace(tmp1);
                }
                break;
            case "l":
            case "L":
                for (const obj of objects) {
                    const tmp1 = obj.pos.clone();
                    tmp1.to_inplace(mousePos);
                    tmp1.rotate_inplace(-Math.PI / 2);
                    tmp1.normalize_inplace();
                    tmp1.scale_inplace(obj.vel.mag());

                    obj.vel.set_vec_inplace(tmp1);
                }
                break;
            case "e":
            case "E":
                let shift_vector = new Vec2DInplace();
                for (const obj of objects) {
                    shift_vector.add_vec_inplace(obj.pos);
                }
                shift_vector.scale_inplace(1 / objects.length);
                shift_vector.to_inplace(mousePos);
                // let shift_vector = objects
                //     .reduce((acc, val) => acc.add(val.pos), new Vec2DInplace())
                //     .scale(1 / objects.length)
                //     .to(mousePos);

                for (const obj of objects) {
                    obj.pos.add_vec_inplace(shift_vector);
                }
                break;

            case "u":
            case "U":
                const radius = 100;
                const relative_circle_vec = new Vec2DInplace(0, radius);
                const angle = (Math.PI * 2) / objects.length;

                for (const obj of objects) {
                    const tmp1 = mousePos.clone();
                    tmp1.add_vec_inplace(relative_circle_vec);
                    obj.pos.set_vec_inplace(tmp1);

                    const tmp2 = obj.pos.clone();
                    tmp2.to_inplace(mousePos);
                    tmp2.rotate_inplace(90);
                    tmp2.scale_inplace(10);
                    obj.vel.set_vec_inplace(tmp2);

                    relative_circle_vec.rotate_inplace(angle);
                }
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
    for (const obj of objects) {
        const dist1 = mousePos.clone();
        dist1.to_inplace(closest.pos);

        const dist2 = mousePos.clone();
        dist2.to_inplace(obj.pos);

        if (dist1.mag() > dist2.mag()) {
            closest = obj;
        }
    }
    return closest;
}

function isnan() {
    const nans = [];
    for (let i = 0; i < arguments.length; i++) {
        if (isNaN(arguments[i])) {
            nans.push(i);
        }
    }

    if (nans.length > 0) {
        throw new Error(`NAN detected at index(es) ${nans}`);
    }
}
