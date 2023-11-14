class Vector {
  /**
   * Creates a 2D vector.
   * If x or y is not specified, they are 0 by default.
   * @param {number} x Horizontal component.
   * @param {number} y Vertical component.
   */
  constructor(x, y) {
    this.x = x === undefined || typeof x !== "number" ? 0 : x;
    this.y = y === undefined || typeof y !== "number" ? 0 : y;
  }

  /**
   * Returns a new Vector. Adds the horizontal and vertical components to the subject Vector.
   * @param {number} x Horizontal component.
   * @param {number} y Vertical component.
   * @returns {Vector}
   */
  add(x, y) {
    return new Vector(this.x + x, this.y + y);
  }

  /**
   * Returns a new Vector. Scales the subject Vector by the given factor.
   * @param {number} f Scale factor.
   * @returns {Vector}
   */
  scale(f) {
    return new Vector(this.x * f, this.y * f);
  }

  /**
   * Returns the magnitude (absolute value, length) of a Vector.
   * @returns {number}
   */
  magnitude() {
    return Math.hypot(this.x, this.y);
  }

  /**
   * Returns a new Vector. Normalizes the subject Vector. Returns a 0 Vector if magnitude is 0.
   * @returns {Vector}
   */
  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector();
    return new Vector(this.x / mag, this.y / mag);
  }

  /**
   * Returns a new Vector. Rotates the subject Vector in 2D space by the given angle amount in radians.
   * @param {number} radians Angle in radians
   * @returns {Vector}
   */
  rotate(radians) {
    return new Vector(Math.cos(radians) * this.x, Math.sin(radians) * this.y);
  }
}

class Item {
  /**
   * Item class. Holds a position and data.
   * @param {string} type ID of item id. Will default to "air" if omitted.
   * @param {number} x Horizontal position.
   * @param {number} y Vertical position.
   */
  constructor(type, x, y) {
    this.type = type ?? "air";
    this.pos = new Vector(x, y);
  }
}
