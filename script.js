const DOM_display = document.querySelector("#display");

let blinking = true;

setTimeout(() => {
  type_on_screen(DOM_display, "Paladynee", Math.random() * 75 + 25);
}, 1000);

function type_on_screen(element, target_string, interval_ms) {
  let buffer = "";
  let i = 1;
  const closure = () => {
    buffer = target_string.substring(0, i);
    element.innerHTML = buffer + (blinking ? "_" : "");

    i += 1;
    if (i != target_string.length + 1) setTimeout(closure, interval_ms);
    else
      setTimeout(delete_from_screen, 3000, element, target_string, interval_ms);
  };
  closure();
}

function delete_from_screen(element, target_string, interval_ms) {
  const initial_string = target_string;
  let buffer = "";
  let i = 1;
  const closure = () => {
    buffer = target_string.substring(0, initial_string.length - i);
    element.innerHTML = buffer + (blinking ? "_" : "");

    i += 1;
    if (i != target_string.length + 1) setTimeout(closure, interval_ms);
    else
      setTimeout(
        type_on_screen,
        1000,
        element,
        target_string,
        Math.random() * 75 + 25
      );
  };
  closure();
}

setInterval(() => {
  if (DOM_display.innerHTML.endsWith("_")) {
    DOM_display.innerHTML = DOM_display.innerHTML.substring(
      0,
      DOM_display.innerHTML.length - 1
    );
    blinking = false;
  } else {
    DOM_display.innerHTML += "_";
    blinking = true;
  }
}, 530);

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});
