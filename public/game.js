import SayHello from './options.js';
const socket = io();

//creating a new scene named "Game"
let gameScene = new Phaser.Scene('Game');

let keyA;
let keyS;
let keyD;
let keyW;
//the games configuration
let config = {
  type: Phaser.Auto, //Render in WebGL or Canvas
  width: 800,
  height: 600,
  scene: gameScene, //Our scene
  backgroundColor: 'white'
};

// create the game, and pass it the config
var game = new Phaser.Game(config);

gameScene.init = function() {
  this.playerSpeed = 1;
}

gameScene.preload = function() {
  this.load.image('background', 'assets/bluemoon.png');
  this.load.image('monkey', 'assets/monkey.png');
}

gameScene.create = function() {
  var bg = this.add.sprite(0, 0, 'background');
  bg.setOrigin(0,0);

  var randomX = Math.random() * 750;
  var randomY = Math.random() * 550;

  while(randomX < 20) {
    randomX = Math.random() * 750;
  }

  while(randomY < 20) {
    randomy = Math.random() * 550;
  }

  console.log(randomX);

  this.monkey = this.add.sprite(randomX, randomY, 'monkey');
  this.monkey.setScale(0.07);
  console.log(this.monkey);

  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
}

gameScene.update = function() {
  if(keyW.isDown && keyD.isDown) {
    this.monkey.x += this.playerSpeed;
    this.monkey.y -= this.playerSpeed;
  }
  else if(keyW.isDown && keyA.isDown) {
    this.monkey.x -= this.playerSpeed;
    this.monkey.y -= this.playerSpeed;
  }
  else if(keyS.isDown && keyA.isDown) {
    this.monkey.x -= this.playerSpeed;
    this.monkey.y += this.playerSpeed;
  }
  else if(keyS.isDown && keyD.isDown) {
    this.monkey.x += this.playerSpeed;
    this.monkey.y += this.playerSpeed;
  }
  else if(keyA.isDown) {
   this.monkey.x -= this.playerSpeed;
  } else if(keyS.isDown) {
   this.monkey.y += this.playerSpeed;
  } else if(keyD.isDown) {
   this.monkey.x += this.playerSpeed;
  } else if(keyW.isDown) {
   this.monkey.y -= this.playerSpeed;
  }

}

function move() {
  let code = event.keyCode;
  if(code === Phaser.Input.Keyboard.KeyCodes.D) {
    this.monkey.x += this.playerSpeed;
  }
}
