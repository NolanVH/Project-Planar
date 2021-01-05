# Project-Planar
### Description
Project-Planar is a simple multiplayer game created using [Node.js](https://nodejs.org/), [Socket.io](https://socket.io/), and [Phaser3](https://phaser.io/phaser3).
It's purpose is to demonstrate and showcase a simple client-server architecture, as well as some common software design patterns. This game was developed for a third year software engineering course at the University of Victoria by [Brooke Martin](https://github.com/brookeireland), [Keegan Kavanagh](https://github.com/KeeganCK), and [Nolan Van Hell](https://github.com/NolanVH). 

A current version of the game can be played at [https://project-planar.herokuapp.com/](https://project-planar.herokuapp.com/)

### Running the game locally
##### Prerequisites
Requires [Node.js](https://nodejs.org/) 12.18.4 or later is installed.


##### Setup
1. Clone or download this repo locally

2. In a terminal window navigate to the root directory of the project you cloned or downloaded:  
    eg. if saved in the home directory in Linux:
    ```
    cd ~/Project-Planar
    ```  

3. Install the Node dependencies required by the project:
    ```
    npm install
    ```
    
4. Start the game locally:
    ```
    node index.js
    ```
    
5. Navigate your browser to the page at [localhost:3000](https://localhost:3000) and you should be able to play the game. Have fun!

Optionally, open your local port or use a tool such as the Node package [localtunnel](https://www.npmjs.com/package/localtunnel) to allow others to connect to your local version of the game.
