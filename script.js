// bad code ahead...
const display_element = document.querySelector("#display");

let currently_blinking = true;

setTimeout(() => {
    type_on_screen(display_element, "Paladynee", Math.random() * 75 + 25);
}, 1000);

function type_on_screen(element, target_string, interval_ms) {
    let str_buf = "";
    let i = 1;
    const closure = () => {
        str_buf = target_string.substring(0, i);
        element.innerHTML = str_buf + (currently_blinking ? "_" : "");

        i += 1;
        if (i != target_string.length + 1) setTimeout(closure, interval_ms);
        else setTimeout(delete_from_screen, 3000, element, target_string, interval_ms);
    };
    closure();
}

function delete_from_screen(element, target_string, interval_ms) {
    const initial_string = target_string;
    let str_buf = "";
    let i = 1;
    const closure = () => {
        str_buf = target_string.substring(0, initial_string.length - i);
        element.innerHTML = str_buf + (currently_blinking ? "_" : "");

        i += 1;
        if (i != target_string.length + 1) setTimeout(closure, interval_ms);
        else setTimeout(type_on_screen, 1000, element, target_string, Math.random() * 75 + 25);
    };
    closure();
}

setInterval(() => {
    if (display_element.innerHTML.endsWith("_")) {
        display_element.innerHTML = display_element.innerHTML.substring(0, display_element.innerHTML.length - 1);
        currently_blinking = false;
    } else {
        display_element.innerHTML += "_";
        currently_blinking = true;
    }
}, 530);

// i dont remember why i added this, commenting it out for now
// window.addEventListener("contextmenu", (e) => {
//     e.preventDefault();
// });
