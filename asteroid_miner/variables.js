const held_keys = new Set();
const playfield = [];
const slots = [];
const slot_size = 50; //px
let time = performance.now();

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.querySelector("#game");
/**
 * @type {CanvasRenderingContext2D}
 */
const ctx = canvas.getContext("2d");

const item_image_table = new Map();
item_image_table.set("air", "./img/air.png");
item_image_table.set("dirt", "./img/dirt.png");

const images = {};
