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

let player;
let enemyPlayer = {
  id:"",
  sprite:""
};
let enemyPlayers = [];

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
    randomY = Math.random() * 550;
  }

  player = {
    name:"monkey",
    posX:randomX,
    posY:randomY,
    id:socket.id
  }

  this.monkey = this.add.sprite(player.posX, player.posY, player.name);
  this.monkey.setScale(0.07);

  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

  socket.emit('player', player);

  socket.on('data', playerList => {
    for (let i = 0; i < playerList.length; i++) {
      if (playerList[i].id !== socket.id) {
        // let otherPlayer = new Player(playerList[i].name, playerList[i].x, playerList[i].y, playerList[i].id);
        this.otherPlayer = this.add.sprite(playerList[i].posX, playerList[i].posY, playerList[i].name)
        this.otherPlayer.setScale(0.07);
        enemyPlayer.id = playerList[i].id;
        enemyPlayer.sprite = this.otherPlayer;
        enemyPlayers.push(enemyPlayer);
      }
    }
  })
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

  player.posX = this.monkey.x;
  player.posY = this.monkey.y;

  socket.emit('update', player);

  socket.on('updateData', playerList => {
    if (playerList.length > enemyPlayers.length) {
      const missingObject = playerList.filter(o=> !enemyPlayers.some(i=> i.id === o.id));
      for (let i = 0; i < missingObject.length; i++) {
        if (missingObject[i].id !== socket.id) {
          this.missingSprite = this.add.sprite(missingObject[i].posX, missingObject[i].posY, missingObject[i].name)
          this.missingSprite.setScale(0.07);
          enemyPlayer.id = missingObject[i].id;
          enemyPlayer.sprite = this.missingSprite;
          enemyPlayers.push(enemyPlayer);
        }
      }

      // let foundMissing = false;
      // for (let i = 0; i < playerList.length(); i++) {
      //   for (let j = 0; j < enemyPlayers.length; j++) {
      //     if ()
      //   }
      // }
    }

    let found = false;
    for (let i = 0; i < playerList.length; i++) {
      for (let j = 0; j < enemyPlayers.length; j++) {
        if (playerList[i].id === enemyPlayers[j].id) {
          enemyPlayers[j].sprite.x = playerList[i].posX;
          enemyPlayers[j].sprite.y = playerList[i].posY;
          found = true;
        }
        if (i === playerList.length - 1 && found === false) {
          enemyPlayers[j].sprite.destroy(true);
          enemyPlayers.splice(j, 1);
        }
      }
    }
  })

}

function move() {
  let code = event.keyCode;
  if(code === Phaser.Input.Keyboard.KeyCodes.D) {
    this.monkey.x += this.playerSpeed;
  }
}