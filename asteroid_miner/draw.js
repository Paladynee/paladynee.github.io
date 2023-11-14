function draw() {
  const now = performance.now();
  let dt = time - now;
  time = now;



  requestAnimationFrame(draw);
}
