//creating a new scene named "Game"
let gameScene = new Phaser.Scene('Game');

//the games configuration
let config = {
  type: phaser.Auto, //Render in WebGL or Canvas
  width: 640,
  height: 360,
  scene: gameScene //Our scene
};

// create the game, and pass it the config
let game = new Phaser.Game(config);
