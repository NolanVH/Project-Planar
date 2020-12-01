import SayHello from './options.js';

//the games configuration
let config = {
  type: Phaser.Auto, //Render in WebGL or Canvas
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y:0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: 'white'
};

// create the game, and pass it the config
var game = new Phaser.Game(config);

function preload() {
  this.load.image('background', 'assets/honeycomb.jpg');
  this.load.image('monkey', 'assets/monkey.png');
  this.load.image('monkeyEnemy', 'assets/monkeyenemy.png');
}

function create() {
  var self = this;
  this.socket = io();
  this.players = this.add.group();

  var bg = this.add.sprite(0, 0, 'background');
  bg.setOrigin(0,0);

  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        displayPlayers(self, players[id], 'monkey');
      } else {
        displayPlayers(self, players[id], 'monkeyEnemy');
      }
    });
  });

  this.socket.on('newPlayer', function (playerInfo) {
    displayPlayers(self, playerInfo, 'monkeyEnemy');
  });

  this.socket.on('disconnect', function (playerId) {
    self.players.getChildren().forEach(function (player) {
      if (playerId === player.playerId) {
        player.destroy();
      }
    });
  });

  this.socket.on('playerUpdates', function (players) {
    Object.keys(players).forEach(function (id) {
      self.players.getChildren().forEach(function (player) {
        if (players[id].playerId === player.playerId) {
          player.setRotation(players[id].rotation);
          player.setPosition(players[id].x, players[id].y);
        }
      });
    });
  });

  this.cursors = this.input.keyboard.addKeys({
    up:Phaser.Input.Keyboard.KeyCodes.W,
    down:Phaser.Input.Keyboard.KeyCodes.S,
    left:Phaser.Input.Keyboard.KeyCodes.A,
    right:Phaser.Input.Keyboard.KeyCodes.D
  });
  this.leftKeyPressed = false;
  this.rightKeyPressed = false;
  this.upKeyPressed = false;
  this.downKeyPressed = false;

}

function update() {
  const left = this.leftKeyPressed;
  const right = this.rightKeyPressed;
  const up = this.upKeyPressed;
  const down = this.downKeyPressed;

  if (this.cursors.right.isDown && this.cursors.left.isDown) {
    this.leftKeyPressed = false;
    this.rightKeyPressed = false;
  } else if (this.cursors.left.isDown) {
    this.rightKeyPressed = false;
    this.leftKeyPressed = true;
  } else if (this.cursors.right.isDown) {
    this.leftKeyPressed = false;
    this.rightKeyPressed = true;
  } else {
    this.leftKeyPressed = false;
    this.rightKeyPressed = false;
  }

  if (this.cursors.up.isDown && this.cursors.down.isDown) {
    this.upKeyPressed = false;
    this.downKeyPressed = false;
  } else if (this.cursors.up.isDown) {
    this.downKeyPressed = false;
    this.upKeyPressed = true;
  } else if (this.cursors.down.isDown) {
    this.upKeyPressed = false;
    this.downKeyPressed = true;
  } else {
    this.upKeyPressed = false;
    this.downKeyPressed = false;
  }

  if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed || down !== this.downKeyPressed) {
    this.socket.emit('playerInput', { left: this.leftKeyPressed , right: this.rightKeyPressed, up: this.upKeyPressed, down: this.downKeyPressed });
  }
}

function displayPlayers(self, playerInfo, sprite) {
  const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  player.playerId = playerInfo.playerId;
  self.players.add(player);
}