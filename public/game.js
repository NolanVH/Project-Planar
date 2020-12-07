import IntroScene from './introScene.js';

let gameScene = new Phaser.Scene('Game');

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
  scene: [IntroScene, gameScene],
  backgroundColor: 'white'
};

// create the game, and pass it the config
const game = new Phaser.Game(config);

gameScene.preload = function() {
  this.load.image('background', 'assets/outdoors.jpg');
  this.load.image('monkey0', 'assets/monkeyOrange.png');
  this.load.image('monkey1', 'assets/monkeyGreen.png');
  this.load.image('monkey2', 'assets/monkeyRed.png');
  this.load.image('monkey3', 'assets/monkeyBlue.png');
  this.load.image('monkey4', 'assets/monkeyYellow.png');
  this.load.image('monkey5', 'assets/monkeyPurple.png');
  this.load.image('monkey6', 'assets/monkeyPink.png');
  this.load.image('monkey7', 'assets/monkeyCyan.png');
  this.load.image('poop', 'assets/poop.png');
  this.load.image('redBanana', 'assets/redBanana.png');
  this.load.image('blueBanana', 'assets/blueBanana.png');
  this.load.image('purpleBanana', 'assets/purpleBanana.png');
  this.load.image('yellowBanana', 'assets/yellowBanana.png');
}

gameScene.create = function() {
  const self = this;
  this.socket = io();
  this.players = this.add.group();
  this.projectiles = this.add.group();
  this.items = this.add.group();

  let bg = this.add.sprite(0, 0, 'background');
  bg.setOrigin(0,0);
  bg.setScale(2.3);

  let topThreeText = self.add.text(10 , 0,
    "1st: N/A : 0\n" +
    "2nd: N/A : 0\n" +
    "3rd: N/A : 0",
    { font: '32px Arial' });
  let scoreText = self.add.text(10 , displayHeight - 40, "Score: " + 0, { font: '32px Arial' });
  let healthText = self.add.text(10 , displayHeight - 80, "Health: " + 2, { font: '32px Arial' });
  
  this.input.setDefaultCursor('url(assets/target.cur), crosshair');

  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      displayPlayers(self, players[id], getMonkeyColor(players[id].playerColor));
    });
  });

  this.socket.on('newPlayer', function (playerInfo) {
    displayPlayers(self, playerInfo, getMonkeyColor(playerInfo.playerColor));
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
      respawningText.destroy();
    }
    displayPlayers(self, playerInfo, getMonkeyColor(playerInfo.playerColor));
  })

  this.socket.on('items', function(items) {
    Object.keys(items).forEach(function(type) {
      displayItems(self, items[type], items[type].image);
    })
  })

  this.socket.on('updateItem', function(item) {
    self.items.getChildren().forEach(function (it) {
      if (item.type === it.type) {
        it.setPosition(item.x, item.y);
      }
    });
  })

  this.socket.on('atCapacity', function () {
    self.add.text(300, 0, "Server at capacity (8 players max)", { font: '64px Arial' });
  });

  this.socket.on('updateTopThree', function(topThree) {
    let first = getColor(topThree.topThreePlayers[0]);
    let second = getColor(topThree.topThreePlayers[1]);
    let third = getColor(topThree.topThreePlayers[2]);
    topThreeText.setText(
      "1st: " + first + " : " + topThree.topThreeScores[0] + "\n" +
      "2nd: " + second + " : " + topThree.topThreeScores[1] + "\n" +
      "3rd: " + third + " : " + topThree.topThreeScores[2]);
  })

  function getColor(playerNumber) {
    switch(playerNumber) {
      case 0:
        return "Orange";
      case 1:
        return "Green";
      case 2:
        return "Red";
      case 3:
        return "Blue";
      case 4:
        return "Yellow";
      case 5:
        return "Purple";
      case 6:
        return "Pink";
      case 7:
        return "Cyan";
      case -1:
        return "N/A";
    }
  }

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

gameScene.update = function() {

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

  this.leftMousePressed = this.input.activePointer.leftButtonDown();

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

function displayItems(self, itemInfo, sprite) {
  const item = self.add.sprite(itemInfo.x, itemInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(35, 35);
  item.type = itemInfo.type;
  self.items.add(item);
}

function getMonkeyColor(colorId) {
  switch(colorId) {
    case 0:
      return 'monkey0';
    case 1:
      return 'monkey1';
    case 2:
      return 'monkey2';
    case 3:
      return 'monkey3';
    case 4:
      return 'monkey4';
    case 5:
      return 'monkey5';
    case 6:
      return 'monkey6';
    case 7:
      return 'monkey7';
  }
}
