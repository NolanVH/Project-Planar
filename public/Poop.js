class Poop {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.r = 8;
  }

  show() {
    ellipse(this.x, this.y, this.r*2, this.r*2)
  }
}
