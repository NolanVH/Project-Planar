// const socket = io();
//
// let player;
// let poops = [];
// let player1;
// let players = [];
//
// function setup() {
//   createCanvas(1000, 1000);
//
//   player1 = {
//     x: Math.random()*500,
//     y: Math.random()*500,
//     r: 32
//   }
//
//   player = new Player(player1.x, player1.y, player1.r);
//   console.log(player);
//
//   socket.on('connect', () => {
//     console.log("welcome");
//
//     socket.emit('player', player1);
//
//     socket.on('data', playerList => {
//       for(let i = 0; i < playerList.length; i++) {
//         if (playerList[i].x === player.x && playerList[i].y === player.y) {}
//         else {
//           otherPlayer = new Player(playerList[i].x, playerList[i].y, playerList[i].r);
//           players.push(otherPlayer);
//         }
//       }
//     })
//   })
// }
//
// function draw() {
//   background(220);
//
//   translate(width/2, height/2);
//   translate(-player.x, -player.y);
//   for(let i = 0; i < poops.length; i++) {
//     poops[i].show();
//   }
//
//   let data = {
//     x: player.x,
//     y: player.y,
//     r: player.r
//   }
//
//   socket.emit('update', data);
//
//   player.show();
//
//   for(let i = 0; i < players.length; i++) {
//     players[i].show();
//   }
// }
//
// function keyTyped() {
//   player.move(key)
// }
