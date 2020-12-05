import SayHello from './options.js';
let displayWidth = 1400;
let displayHeight = 900;

//the games configuration
let config = {
  type: Phaser.Auto, //Render in WebGL or Canvas
  width: displayWidth,
  height: displayHeight,
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
  this.load.image('background', 'assets/outdoors.jpg');
  this.load.image('monkey', 'assets/monkey.png');
  this.load.image('monkeyEnemy', 'assets/monkeyenemy.png');
  this.load.image('poop', 'assets/poop.png');
}

function create() {
  var self = this;
  this.socket = io();
  this.players = this.add.group();
  this.projectiles = this.add.group();

  var bg = this.add.sprite(0, 0, 'background');
  bg.setOrigin(0,0);
  bg.setScale(2.3);

  let scoreText = self.add.text(10 , displayHeight - 70, "Score: " + 0, { font: '64px Arial' });
  let healthText = self.add.text(10 , displayHeight - 130, "Health: " + 2, { font: '64px Arial' });
  
  this.input.setDefaultCursor('url(assets/target.cur), crosshair');

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
          if (players[id].playerId === self.socket.id) {
            scoreText.setText("Score: " + players[id].score);
            healthText.setText("Health: " + players[id].health);
          }
        }
      });
    });
  });

  this.socket.on('newProjectile', function (projectileInfo) {
    displayProjectiles(self, projectileInfo, 'poop');
  });

  this.socket.on('projectileUpdates', function (projectiles) {
    Object.keys(projectiles).forEach(function (id) {
      self.projectiles.getChildren().forEach(function (projectile) {
        if (projectiles[id].projectileId === projectile.projectileId) {
          projectile.setPosition(projectiles[id].x, projectiles[id].y);
        }
      });
    });
  });

  this.socket.on('destroyProjectile', function (projectileId) {
    self.projectiles.getChildren().forEach(function (projectile) {
      if (projectileId === projectile.projectileId) {
        projectile.destroy();
      }
    });
  });

  let respawningText;
  this.socket.on('death', function (playerId) {
    self.players.getChildren().forEach(function (player) {
      if (playerId === player.playerId) {
        player.destroy();
        if (player.playerId === self.socket.id){
          respawningText = self.add.text(displayWidth/2, displayHeight/2, 'Respawning...', { font: '64px Arial' }).setOrigin(0.5);
          healthText.setText("Health: " + 0);
        }
      }
    });
  })

  this.socket.on('respawn', function (playerInfo) {
    if (playerInfo.playerId === self.socket.id) {
      displayPlayers(self, playerInfo, 'monkey');
      respawningText.destroy();
    } else {
      displayPlayers(self, playerInfo, 'monkeyEnemy');
    }
  })

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
  this.mousePressed = false;
}

function update() {

  //Movement
  const left = this.leftKeyPressed;
  const right = this.rightKeyPressed;
  const up = this.upKeyPressed;
  const down = this.downKeyPressed;
  const leftMouse = this.leftMousePressed;

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

   if(this.input.activePointer.leftButtonDown()){
     this.leftMousePressed = true;
  } else {
    this.leftMousePressed = false;
  }

  if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed || down !== this.downKeyPressed || leftMouse !== this.leftMousePressed) {
    this.socket.emit('playerInput', { left: this.leftKeyPressed , right: this.rightKeyPressed, up: this.upKeyPressed, down: this.downKeyPressed, leftMouse: this.leftMousePressed });
  }

  //Shooting
  this.socket.emit('cursorInput', {x: game.input.mousePointer.x, y: game.input.mousePointer.y});
}

function displayPlayers(self, playerInfo, sprite) {
  const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  player.playerId = playerInfo.playerId;
  self.players.add(player);
}

function displayProjectiles(self, projectileInfo, sprite) {
  const projectile = self.add.sprite(projectileInfo.x, projectileInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(20, 20);
  projectile.projectileId = projectileInfo.projectileId;
  self.projectiles.add(projectile);
}
