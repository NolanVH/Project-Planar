const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let playerList = [];

function Player(name, posX, posY, id) {
  this.name = name;
  this.posX = posX;
  this.posY = posY;
  this.id = id;
}

console.log("hello there");

//Set static folder
app.use(express.static('public'));


//see when client connects
io.on('connection', socket => {
  console.log("new Connection: " + socket.id);

  //receive player information from client, then create a new Player object and add to players array
  socket.on('player', player => {
    let newPlayer = new Player(player.name, player.posX, player.posY, socket.id);
    playerList.push(newPlayer);
    console.log("players: ", playerList);

    //send data to client with same id
    io.to(socket.id).emit('data', playerList);
  })

  socket.on('disconnect', () => {
    const index = playerList.findIndex(x => x.id === socket.id);

    if(index > -1) {
      playerList.splice(index, 1);
    }
  })

  socket.on('update', data => {
    for(let i = 0; i < playerList.length; i++) {
      if(data.id === playerList[i].id) {
        playerList[i] = data;
      }
    }
    io.to(socket.id).emit('updateData', playerList);
  })

})

const port = process.env.port || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
