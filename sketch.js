let player;
let poops = [];

function setup() {
  createCanvas(1000, 1000);

  player = new Player(1000, 100, 32)

  for(let i = 0; i < 30; i++) {
    poops[i] = new Poop(random(width), random(height));
  }
}

function draw() {
  background(220);

  translate(width/2, height/2);
  translate(-player.x, -player.y);
  for(let i = 0; i < poops.length; i++) {
    poops[i].show();
  }
  player.show();
}

function keyTyped() {
  player.move(key)
}
