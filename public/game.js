/*
  This file contains the main frontend game logic.
  It sends input to the backend and receives game state information from the backend.
 */

// Import the intro scene
import IntroScene from './introScene.js';

// Set the global gameScene variable
let gameScene = new Phaser.Scene('Game');

// Variables for the window size for use throughout the game
let displayWidth = 1400;
let displayHeight = 900;

// Setup the phaser configuration
let config = {
  type: Phaser.Auto, //Render in WebGL or Canvas
  scale: { // Scaling options to fit the game window within the user's browser
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT,
    parent: 'myGame',
    width: displayWidth,
    height: displayHeight
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y:0 }
    }
  },
  scene: [IntroScene, gameScene], // The IntroScene scene is first loaded from introScene.js
  backgroundColor: 'white'
};

// create the game and pass it the config
const game = new Phaser.Game(config);

// Preload is called to load some assets before the game is actually loaded
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

// The create function creates the necessary objects and opens the required sockets
gameScene.create = function() {
  // Set socket
  const self = this;
  this.socket = io();

  // Set the game object groups
  this.players = this.add.group();
  this.projectiles = this.add.group();
  this.items = this.add.group();

  // Render the background and set it's position/scale
  let bg = this.add.sprite(0, 0, 'background');
  bg.setOrigin(0,0);
  bg.setScale(2.3);

  // Render the default text for the top three players, score, and health
  let topThreeText = self.add.text(10 , 0,
    "1st: N/A : 0\n" +
    "2nd: N/A : 0\n" +
    "3rd: N/A : 0",
    { font: '32px Arial' });
  let scoreText = self.add.text(10 , displayHeight - 40, "Score: " + 0, { font: '32px Arial' });
  let healthText = self.add.text(10 , displayHeight - 80, "Health: " + 2, { font: '32px Arial' });

  // Change the default cursor to use a custom one from the assets folder
  this.input.setDefaultCursor('url(assets/target.cur), crosshair');

  // Render the current players when 'currentPlayers'  received from the backend, using the displayPlayers function
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      displayPlayer(self, players[id], getMonkeyColor(players[id].playerColor));
    });
  });

  // Render a single new player when 'newPlayer'  received from the backend, using the displayPlayers function
  this.socket.on('newPlayer', function (playerInfo) {
    displayPlayer(self, playerInfo, getMonkeyColor(playerInfo.playerColor));
  });

  // Remove the rendered player and destroy it's object when a player disconnects
  this.socket.on('disconnect', function (playerId) {
    self.players.getChildren().forEach(function (player) {
      if (playerId === player.playerId) {
        player.destroy();
      }
    });
  });

  /*
    Update the current players' positions when 'playerUpdates' received from the backend
    this will trigger at the end of every update tick on the backend. If the current
    player's socket id matches the received data as we are looping then we also update
    the current player's score and health display.
  */
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

  // Render a new projectile when 'newProjectile'  received from the backend, using the displayPlayers function
  this.socket.on('newProjectile', function (projectileInfo) {
    displayProjectile(self, projectileInfo, 'poop');
  });

  // Update the position of the current projectiles (every tick)
  this.socket.on('projectileUpdates', function (projectiles) {
    Object.keys(projectiles).forEach(function (id) {
      self.projectiles.getChildren().forEach(function (projectile) {
        if (projectiles[id].projectileId === projectile.projectileId) {
          projectile.setPosition(projectiles[id].x, projectiles[id].y);
        }
      });
    });
  });

  // Render the current projectiles when 'currentProjectiles'  received from the backend, using the displayProjectile function
  this.socket.on('currentProjectiles', function (projectiles) {
    Object.keys(projectiles).forEach(function (id) {
      displayProjectile(self, projectiles[id], 'poop');
    });
  });

  // Remove the rendered projectile and destroy it's object when 'destroyProjectile' received from the backend
  this.socket.on('destroyProjectile', function (projectileId) {
    self.projectiles.getChildren().forEach(function (projectile) {
      if (projectileId === projectile.projectileId) {
        projectile.destroy();
      }
    });
  });

  // Put the player into the respawning state when 'death' received from the backend
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

  // Respawn the player with base stats and health when 'respawn' received from the backend
  this.socket.on('respawn', function (playerInfo) {
    if (playerInfo.playerId === self.socket.id) {
      respawningText.destroy();
    }
    displayPlayer(self, playerInfo, getMonkeyColor(playerInfo.playerColor));
  })

  // Render all of the items when 'items' received' from the backend
  this.socket.on('items', function(items) {
    Object.keys(items).forEach(function(type) {
      displayItem(self, items[type], items[type].image);
    })
  })

  // Update a single item postition when 'updateItem' received from the backend
  this.socket.on('updateItem', function(item) {
    self.items.getChildren().forEach(function (it) {
      if (item.type === it.type) {
        it.setPosition(item.x, item.y);
      }
    });
  })

  // When 'atCapacity' received from the backend display a sever at capacity message
  this.socket.on('atCapacity', function () {
    self.add.text(300, 0, "Server at capacity (8 players max)", { font: '64px Arial' });
  });

  // When 'updateTopThree' received from the backend update the top three scores
  this.socket.on('updateTopThree', function(topThree) {
    let first = getColor(topThree.topThreePlayers[0]);
    let second = getColor(topThree.topThreePlayers[1]);
    let third = getColor(topThree.topThreePlayers[2]);
    topThreeText.setText(
      "1st: " + first + " : " + topThree.topThreeScores[0] + "\n" +
      "2nd: " + second + " : " + topThree.topThreeScores[1] + "\n" +
      "3rd: " + third + " : " + topThree.topThreeScores[2]);
  })

  // A function to return the correct player color given the player's number
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

  // Define keys using the phaser built in input class
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

// Update is called every tick
gameScene.update = function() {

  // Variables which hold the previous input values
  const left = this.leftKeyPressed;
  const right = this.rightKeyPressed;
  const up = this.upKeyPressed;
  const down = this.downKeyPressed;
  const leftMouse = this.leftMousePressed;

  // Check the current input and set the current input variables
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

  // Check the current input and set the current input variables
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

  // set the current mouse input variable to match the current input from the user
  this.leftMousePressed = this.input.activePointer.leftButtonDown();

  // If any values have changed since the last update the we send them to the backend
  if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed || down !== this.downKeyPressed || leftMouse !== this.leftMousePressed) {
    this.socket.emit('playerInput', { left: this.leftKeyPressed , right: this.rightKeyPressed, up: this.upKeyPressed, down: this.downKeyPressed, leftMouse: this.leftMousePressed });
  }

  // Send the current player's current mouse pointer location to the backend every update
  this.socket.emit('cursorInput', {x: game.input.mousePointer.x, y: game.input.mousePointer.y});
}

// A function to render a new sprite given a playerInfo object and a preloaded sprite
function displayPlayer(self, playerInfo, sprite) {
  const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  player.playerId = playerInfo.playerId;
  self.players.add(player);
}

// A function to render a new projectile given a projectileInfo object and a preloaded sprite
function displayProjectile(self, projectileInfo, sprite) {
  const projectile = self.add.sprite(projectileInfo.x, projectileInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(20, 20);
  projectile.projectileId = projectileInfo.projectileId;
  self.projectiles.add(projectile);
}

// A function to render a new item given an itemInfo object and a preloaded sprite
function displayItem(self, itemInfo, sprite) {
  const item = self.add.sprite(itemInfo.x, itemInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(35, 35);
  item.type = itemInfo.type;
  self.items.add(item);
}

// A function to return the correct preloaded sprite given the player's colorId
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
