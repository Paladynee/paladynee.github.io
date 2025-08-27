// bad code ahead...
const terminal_default_text = `Microsoft Windows [Version 10.0.19045.5011]
(c) Microsoft Corporation. All rights reserved.

C:\\Users\\Paladynee\\Desktop\\development\\paladynee.github.io\\>`;

const display_element = document.querySelector("#term_display_textbox");

let currently_blinking = true;

setTimeout(() => {
    type_on_screen(display_element, "Paladynee", Math.random() * 75 + 25);
}, 1000);

function type_on_screen(element, target_string, interval_ms) {
    let str_buf = "";
    let i = 1;
    const closure = () => {
        str_buf = target_string.substring(0, i);
        element.innerHTML = terminal_default_text + str_buf + (currently_blinking ? "█" : "");

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
        element.innerHTML = terminal_default_text + str_buf + (currently_blinking ? "█" : "");

        i += 1;
        if (i != target_string.length + 1) setTimeout(closure, interval_ms);
        else setTimeout(type_on_screen, 1000, element, target_string, Math.random() * 75 + 25);
    };
    closure();
}

setInterval(() => {
    if (display_element.innerHTML.endsWith("█")) {
        display_element.innerHTML =
            terminal_default_text + display_element.innerHTML.substring(terminal_default_text.length + 3, display_element.innerHTML.length - 1);
        currently_blinking = false;
    } else {
        display_element.innerHTML += "█";
        currently_blinking = true;
    }
}, 530);

// i dont remember why i added this, commenting it out for now
// window.addEventListener("contextmenu", (e) => {
//     e.preventDefault();
// });

// Get elements
const termHeader = document.getElementById("term_header_title");

let isDragging = false;
let startX,
    startY,
    offsetX = 0,
    offsetY = 0;

// Mouse down event on header to initiate dragging
termHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    // Get the current position of the terminal window
    const rect = term.getBoundingClientRect();
    offsetX = startX - rect.left;
    offsetY = startY - rect.top;

    // Add mousemove and mouseup event listeners
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    // Prevent text selection while dragging
    termHeader.style.userSelect = "none";
});

function onMouseMove(e) {
    if (isDragging) {
        // Calculate new position of the terminal
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        // Apply the new position
        term.style.left = `${x}px`;
        term.style.top = `${y}px`;
    }
}

function onMouseUp() {
    isDragging = false;

    // Remove event listeners when dragging is stopped
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    // Re-enable text selection after dragging
    termHeader.style.userSelect = "auto";
}

const reopen_button = document.createElement("button");
// a big button that says "Reopen Terminal"
reopen_button.style =
    "display:none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.5em; padding: 10px 20px; border: 2px solid black; background-color: white; cursor: pointer;";
reopen_button.innerText = "Reopen Terminal";
reopen_button.addEventListener("click", () => {
    term.style.display = "block";
    reopen_button.style.display = "none";
});
document.body.appendChild(reopen_button);

const close_button = document.getElementById("term_header_buttons_close_hitbox");

close_button.addEventListener("click", () => {
    term.style.display = "none";
    reopen_button.style.display = "block";
});

term.style.top = `${randInt(0, Math.max(window.innerHeight - 600, 0))}px`;
let vw60 = window.innerWidth * 0.6;
term.style.left = `${randInt(0, Math.max(window.innerWidth - vw60, 0))}px`;
term.style.display = "block";

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
