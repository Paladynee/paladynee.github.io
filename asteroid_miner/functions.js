function initialize_slots() {
  const width = canvas.width;
  const height = canvas.height;

  const amount_w = ~~(width / slot_size - 100) || 1;
  const amount_h = ~~(height / slot_size - 100) || 1;

  for (let y = 0; y < amount_h; y++) {
    for (let x = 0; x < amount_w; x++) {
      slots.push(new Item(), x, y);
    }
  }
}

async function fetch_images() {
  for (let [id, path] of item_image_table) {
  }
}
