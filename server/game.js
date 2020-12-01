const players = {};

const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  autoFocus: false
};

function preload() {
  this.load.image('background', 'assets/bluemoon.png');
  this.load.image('monkey', 'assets/monkey.png');
}

function create() {
  const self = this;
  this.players = this.physics.add.group();

  io.on('connection', function (socket) {
    console.log('a user connected');

    players[socket.id] = {
      rotation: 0,
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50,
      playerId: socket.id,
      input: {
        left: false,
        right: false,
        up: false,
        down: false
      }
    };

    addPlayer(self, players[socket.id]);
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', function () {
      console.log('user disconnected');
      removePlayer(self, socket.id);
      delete players[socket.id];
      io.emit('disconnect', socket.id);
    });

    socket.on('playerInput', function (inputData) {
      handlePlayerInput(self, socket.id, inputData);
    });

  });
}

function update() {
  this.players.getChildren().forEach((player) => {
    const input = players[player.playerId].input;

    if (input.up) {
      player.setVelocityY(-100);
    } else if (input.down) {
      player.setVelocityY(100);
    } else if (!input.up && !input.down) {
      player.setVelocityY(0);
    }

    if (input.left) {
      player.setVelocityX(-100);
    } else if (input.right) {
      player.setVelocityX(100);
    } else if (!input.left && !input.right) {
      player.setVelocityX(0);
    }

    players[player.playerId].x = player.x;
    players[player.playerId].y = player.y;
    players[player.playerId].rotation = player.rotation;

  });
  this.physics.world.wrap(this.players, 5);
  io.emit('playerUpdates', players);
}

function handlePlayerInput(self, playerId, input) {
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      players[player.playerId].input = input;
    }
  });
}

function addPlayer(self, playerInfo) {
  const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'monkey').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  player.setDrag(100);
  player.setAngularDrag(100);
  player.setMaxVelocity(100);
  player.playerId = playerInfo.playerId;
  self.players.add(player);
}

function removePlayer(self, playerId) {
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      player.destroy();
    }
  });
}

const game = new Phaser.Game(config);

window.gameLoaded();