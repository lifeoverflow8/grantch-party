// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

isHost = false;

server_clients = [];

currentGame = 'funkyJumps';

const FPS = 60;

var http = require('http').createServer();
var server_io = require('socket.io')(http);

var ip = require('ip');
document.getElementById('local-ip').innerHTML = ip.address();

server_io.on('connection', (socket) => {
    server_io.to(socket.id).emit('old_clients', server_clients);

    server_clients.push({
        id: socket.id,
        nickname: 'anon',
        color: '#000'
    });

    server_io.to(socket.id).emit('id', socket.id);
    server_io.emit('new_client', socket.id);

    console.log('user connected');

    server_io.on('nickname', function(id, nickname) {
        for (i = 0; i < server_clients.length; i++) {
            if (server_clients[i].id == id) {
                server_clients[i].nickname = nickname;
            }
        }

        server_io.emit('nickname', id, nickname);
    });
    socket.on('disconnect', function() {
        for (i = 0; i < server_clients.length; i++) {
            if (server_clients[i].id == socket.id) {
                server_clients.splice(i, 1);
                server_io.emit('disconnect', server_clients[i].id);
            }
        }
        console.log('user disconnected');
    });

    //F(x)nky Jumps
    socket.on('fj_pos_y', function(y, id) {
        server_io.emit('fj_pos_y', y, id);
    });
});

gameTime = 0;

//Funky Jumps
functions = ['sin(x)', 'sin(2x)'];
functionTimer = 4 * FPS;

setInterval(function() {
    gameTime++;

    if (currentGame == 'funkyJumps') {
        functionTimer ++;

        if (functionTimer > 5 * FPS / gameTime * 1870) {
            //Send a function
            server_io.emit('fj_func', functions[Math.floor(Math.random() * functions.length)], Math.random() * Math.PI * 2);
            functionTimer = 0;
        }
        for (i = 0; i < server_clients.length; i ++) {
            server_io.emit('fj_pos_x', i * 256 - 200, server_clients[i].id);
        }
    }


}, 1000 / FPS);

document.getElementById('host-button').onclick = function() {
    http.listen(3773, function() {
        console.log('listening on port:3773');
        isHost = true;
    });

    document.getElementById('join-button').onclick();
}