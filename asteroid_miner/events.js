window.addEventListener("keydown", (e) => {
  held_keys.add(e.code);
});

window.addEventListener("keyup", (e) => {
  held_keys.delete(e.code);
});

window.addEventListener("resize", (e) => {
  //
});

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});
