class Player {
  constructor(px, py, pr) {
    this.x = px;
    this.y = py;
    this.r = pr;
  }

  show() {
    ellipse(this.x, this.y, this.r*2, this.r*2);
  }

  move(key) {
    if(key === 'w') {
      this.y = this.y - 15;
    }
    if(key === 's') {
      this.y = this.y + 15;
    }
    if(key === 'a') {
      this.x = this.x - 15
    }
    if(key === 'd') {
      this.x = this.x + 15
    }
  }
}
