const players = {};
const projectiles = {};
const items = {};

const displayWidth = 1400;
const displayHeight = 900;

let d = new Date();

const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: displayWidth,
  height: displayHeight,
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

 }

function create() {
  const self = this;
  this.players = this.physics.add.group();
  this.projectiles = this.physics.add.group();
  this.items = this.physics.add.group();

  this.physics.add.collider(this.players);

  let factory = new PickupFactory(self);
  let healthItem = factory.spawnItem("health");
  let damageItem = factory.spawnItem("damage");
  let teleportItem = factory.spawnItem("teleport");
  let speedItem = factory.spawnItem("speed");

  items[healthItem.type] = healthItem;
  items[damageItem.type] = damageItem;
  items[teleportItem.type] = teleportItem;
  items[speedItem.type] = speedItem;

  io.on('connection', function (socket) {
    console.log('a user connected');

    players[socket.id] = {
      rotation: 0,
      x: Math.floor(Math.random() * displayWidth - 100) + 50,
      y: Math.floor(Math.random() * displayHeight - 100) + 50,
      playerId: socket.id,
      nextFire: 0,
      shotTimer: 1000,
      health: 2,
      respawnTimer: 0,
      respawning: false,
      score: 0,
      speed: 150,
      input: {
        left: false,
        right: false,
        up: false,
        down: false,
        leftMouse: false
      },
      cursorInput: {
        x: 0,
        y: 0
      }
    };

    io.emit('items', items);

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

    socket.on('cursorInput', function (inputData) {
      handleCursorInput(self, socket.id, inputData);
    });

  });

  this.physics.add.overlap(this.players, this.projectiles, function(player, projectile) {
    if (player.playerId !== projectile.playerId) {
      players[player.playerId].health -= 1;
      if (players[player.playerId].health <= 0) {
        let d = new Date();
        players[player.playerId].respawning = true;
        players[player.playerId].respawnTimer = d.getTime();
        players[player.playerId].x = Math.floor(Math.random() * displayWidth - 100) + 50;
        players[player.playerId].y = Math.floor(Math.random() * displayHeight - 100) + 50;
        players[player.playerId].speed = 100;
        players[player.playerId].shotTimer = 1000;
        players[player.playerId].input.left = false;
        players[player.playerId].input.right = false;
        players[player.playerId].input.up = false;
        players[player.playerId].input.down = false;
        players[player.playerId].input.leftMouse = false;
        removePlayer(self, player.playerId);
        players[projectile.playerId].score += 1;
        io.emit('death', player.playerId);
      }
      removeProjectile(self, projectile.projectileId);
    }
  })
  this.physics.add.overlap(this.players, this.items, function(player, item) {
    console.log("player: ", player.playerId);
    console.log("item: ", item.type);
    if (item.type === "health") {
      if(players[player.playerId].health < 10) {
        players[player.playerId].health += items[item.type].modifier;
      }
    }
    else if (item.type === "damage") {
      if(players[player.playerId].shotTimer > 700) {
        players[player.playerId].shotTimer = players[player.playerId].shotTimer / items[item.type].modifier;
      }
    }
    else if (item.type === "teleport") {
      players[player.playerId].x = items[item.type].modifier;
      players[player.playerId].y = items[item.type].modifier2;

      player.x = items[item.type].modifier;
      player.y = items[item.type].modifier2;
    }
    else if (item.type === "speed") {
      if(players[player.playerId].speed < 224) {
        players[player.playerId].speed = players[player.playerId].speed * items[item.type].modifier;
      }
    }
    let x = Math.floor(Math.random() * (displayWidth - 100)) + 50;
    let y = Math.floor(Math.random() * (displayHeight - 100)) + 50;
    item.x = x;
    item.y = y;
    items[item.type].x = x;
    items[item.type].y = y;
    io.emit('updateItem', items[item.type]);
  });
}

function update() {
  const self = this;

  Object.keys(players).forEach(function (playerId) {
    if (players[playerId].respawning === true){
      let d = new Date();
      if (players[playerId].respawnTimer + 3000 <= d.getTime()) {
        players[playerId].health = 2;
        addPlayer(self, players[playerId]);
        io.emit('respawn', players[playerId]);
        players[playerId].respawning = false;
        players[playerId].respawnTimer = 0;
      }
    }
  })

  this.players.getChildren().forEach((player) => {
    if (players[player.playerId].respawning === true) {
      removeProjectile(self, player.playerId);
    } else {
      const input = players[player.playerId].input;
      const cursorInput = players[player.playerId].cursorInput;

      if (input.up) {
        player.setVelocityY(-1 * players[player.playerId].speed);
      } else if (input.down) {
        player.setVelocityY(players[player.playerId].speed);
      } else if (!input.up && !input.down) {
        player.setVelocityY(0);
      }

      if (input.left) {
        player.setVelocityX(-1 * players[player.playerId].speed);
      } else if (input.right) {
        player.setVelocityX(players[player.playerId].speed);
      } else if (!input.left && !input.right) {
        player.setVelocityX(0);
      }

      let cursorAngle = Phaser.Math.Angle.Between(player.x, player.y, cursorInput.x, cursorInput.y);
      player.rotation = cursorAngle;

      players[player.playerId].x = player.x;
      players[player.playerId].y = player.y;
      players[player.playerId].rotation = player.rotation;

      let projectileid = this.time.now + player.playerId;
      if (input.leftMouse) {
        if (self.time.now > players[player.playerId].nextFire) {
          projectiles[projectileid] = {
            x: player.x,
            y: player.y,
            playerId: player.playerId,
            projectileId: projectileid
          }
          players[player.playerId].nextFire = self.time.now + players[player.playerId].shotTimer;
          addProjectile(self, projectiles[projectileid]);
          if (projectiles) {
            this.projectiles.getChildren().forEach((projectile) => {
              if (projectile.projectileId === projectiles[projectileid].projectileId) {
                this.physics.moveTo(projectile, cursorInput.x, cursorInput.y, 400);
              }
            })
          }
        }
      }

      if (projectiles) {
        Object.keys(projectiles).forEach(function (projectileId) {
          self.projectiles.getChildren().forEach(function (projectile) {
            if (projectileId === projectile.projectileId) {
              if (projectile.x >= displayWidth || projectile.x <= 0 || projectile.y >= displayHeight || projectile.y <= 0) {
                removeProjectile(self, projectiles[projectileId].projectileId);
              } else {
                projectiles[projectileId].x = projectile.x;
                projectiles[projectileId].y = projectile.y;
              }
            }
          })
        })
      }
    }

  });

  this.physics.world.wrap(this.players, 5);
  this.physics.world.wrap(this.projectiles, 5);
  io.emit('playerUpdates', players);
  io.emit('projectileUpdates', projectiles);
}

function handlePlayerInput(self, playerId, input) {
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      players[player.playerId].input = input;
    }
  });
}

function handleCursorInput(self, playerId, cursorInput) {
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      players[player.playerId].cursorInput = cursorInput;
    }
  });
}

function addPlayer(self, playerInfo) {
  const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'monkey').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  player.setDrag(100);
  player.setAngularDrag(0);
  player.setMaxVelocity(337.5);
  player.playerId = playerInfo.playerId;
  self.players.add(player);
}

function addProjectile(self, projectileInfo) {
   const projectile = self.physics.add.image(projectileInfo.x, projectileInfo.y, 'monkey').setOrigin(0.5, 0.5).setDisplaySize(20, 20);
   projectile.setDrag(100);
   projectile.setAngularDrag(0);
   projectile.setMaxVelocity(1000);
   projectile.projectileId = projectileInfo.projectileId;
   projectile.playerId = projectileInfo.playerId;
   self.projectiles.add(projectile);
   io.emit('newProjectile', projectiles[projectileInfo.projectileId]);
 }

function removePlayer(self, playerId) {
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      player.destroy();
    }
  });
}

function removeProjectile(self, projectileId) {
  self.projectiles.getChildren().forEach((projectile) => {
    if (projectileId === projectile.projectileId) {
      projectile.destroy();
      io.emit('destroyProjectile', projectiles[projectileId].projectileId);
      delete projectiles[projectileId];
    }
  });
}

function PickupFactory(self) {
  let thisItem;
  this.spawnItem = function(type) {
    let item;
    if (type === "health") {
      item = new healthItem();
    }
    else if (type === "damage") {
      item = new damageItem();
    }
    else if (type === "teleport") {
      item = new teleportItem();
    }
    else if (type === "speed") {
      item = new speedItem();
    }

    item.type = type;
    console.log("image: " + item.image);
    let x = Math.floor(Math.random() * (displayWidth - 100)) + 20;
    let y = Math.floor(Math.random() * (displayHeight - 100)) + 20;
    const physicsItem = self.physics.add.image(x, y, item.image).setOrigin(0.5, 0.5).setDisplaySize(35, 35);
    physicsItem.type = type;
    self.items.add(physicsItem);
    if(item.modifier2) {
      thisItem = {
        x: x,
        y: y,
        type: type,
        image: item.image,
        modifier: item.modifier,
        modifier2: item.modifier2
      }
    } else {
      thisItem = {
        x: x,
        y: y,
        type: type,
        image: item.image,
        modifier: item.modifier
      }
    }
    return thisItem;
  }
}

let healthItem = function() {
  this.image = 'blueBanana';
  this.modifier = 2;
}

let damageItem = function() {
  this.image = 'redBanana';
  this.modifier = 1.5;
}

let teleportItem = function() {
  this.image = 'purpleBanana';
  this.modifier = Math.floor(Math.random() * displayWidth - 100) + 20;
  this.modifier2 = Math.floor(Math.random() * displayHeight - 100) + 20;
}

let speedItem = function() {
  this.image = 'yellowBanana';
  this.modifier = 1.5;
}

const game = new Phaser.Game(config);

window.gameLoaded();