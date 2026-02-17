/// Formats and prints a message to the standard console.
export function printf(format = "", ...args) {
    _printf_raw(console.log, format, ...args);
}

/// Formats and prints a message to the error console.
export function eprintf(format = "", ...args) {
    _printf_raw(console.error, format, ...args);
}

/// Core formatting engine supporting C-style format specifiers like %d, %f, %s, and %x.
function _printf_raw(log_closure, format = "", ...args) {
    let out = "";
    let argIndex = 0;
    let start = 0;

    for (let i = 0; i < format.length; i++) {
        if (format[i] !== "%" || i + 1 >= format.length) continue;

        out += format.substring(start, i);
        const spec = format[i + 1];

        if (spec === "%") {
            out += "%";
            i++;
            start = i + 1;
            continue;
        }

        if (argIndex >= args.length) {
            throw new Error(`Missing argument for %${spec} at position ${i}`);
        }

        const arg = args[argIndex++];

        switch (spec) {
            case "s":
                if (typeof arg !== "string")
                    throw new TypeError(`%s expected string, got ${typeof arg}`);
                out += arg;
                break;
            case "d":
            case "i":
                if (typeof arg !== "number")
                    throw new TypeError(`%${spec} expected number, got ${typeof arg}`);
                out += Math.trunc(arg).toString();
                break;
            case "f":
                if (typeof arg !== "number")
                    throw new TypeError(`%f expected number, got ${typeof arg}`);
                out += arg.toString();
                break;
            case "o":
                if (typeof arg !== "number")
                    throw new TypeError(`%o expected number, got ${typeof arg}`);
                out += (arg >>> 0).toString(8);
                break;
            case "x":
                if (typeof arg !== "number")
                    throw new TypeError(`%x expected number, got ${typeof arg}`);
                out += (arg >>> 0).toString(16);
                break;
            case "X":
                if (typeof arg !== "number")
                    throw new TypeError(`%X expected number, got ${typeof arg}`);
                out += (arg >>> 0).toString(16).toUpperCase();
                break;
            case "c":
                if (typeof arg !== "number")
                    throw new TypeError(`%c expected number, got ${typeof arg}`);
                out += String.fromCharCode(arg);
                break;
            case "p":
                if (typeof arg !== "number")
                    throw new TypeError(`%p expected number, got ${typeof arg}`);
                out += "0x" + (arg >>> 0).toString(16).padStart(8, "0");
                break;
            default:
                throw new Error(`Unknown format specifier: %${spec}`);
        }

        i++;
        start = i + 1;
    }

    out += format.substring(start);
    log_closure(out);
}
