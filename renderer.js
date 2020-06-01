// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

isHost = false;

server_clients = [];

currentGame = 'lobby';

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
        color: '#000',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        grounded: false
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

    //Beatdown Boulevard
    socket.on('bb_right', function() {
        //do the right thing
        for (i = 0; i < server_clients.length; i++) {
            if (server_clients[i].id == socket.id) {
                console.log('but does this happen');
                server_clients[i].vx += playerAccel;
            }
        }
    });

    socket.on('bb_left', function() {
        //do the right thing
        for (i = 0; i < server_clients.length; i++) {
            if (server_clients[i].id == socket.id) {
                server_clients[i].vx -= playerAccel;
            }
        }
    });

    socket.on('bb_jump', function() {
        for (i = 0; i < server_clients.length; i++) {
            if (server_clients[i].id == socket.id) {
                if (server_clients[i].grounded) {
                    server_clients[i].vy += playerJumpForce;
                }
            }
        }
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

    if (currentGame == 'beatDown') {
        //Give clients there x and y positions
        for (i = 0; i < server_clients.length; i++) {
            server_clients[i].vy += playerGravity;

            server_clients[i].vx *= playerFriction;

            if (server_clients[i].y < - 1000) {
                server_clients[i].x = 0;
                server_clients[i].y = 0;
                server_clients[i].vx = 0;
                server_clients[i].vy = 0;
            }

            //small physics thing don't even
            server_clients[i].grounded = false;
            for (j = 0; j < staticObjects.length; j++) {
                indexX = 0;
                while(rectanglesCentreAnchorOverlapping(server_clients[i].x + server_clients[i].vx, server_clients[i].y, playerWidth, playerHeight, staticObjects[j].x, staticObjects[j].y, staticObjects[j].w, staticObjects[j].h) && indexX < 100) {
                    indexX ++;
                    server_clients[i].vx -= Math.sign(server_clients[i].vx + 0.000000001);
                }

                indexY = 0;
                while(rectanglesCentreAnchorOverlapping(server_clients[i].x, server_clients[i].y + server_clients[i].vy, playerWidth, playerHeight, staticObjects[j].x, staticObjects[j].y, staticObjects[j].w, staticObjects[j].h) && indexX < 100) {
                    indexY++;
                    server_clients[i].vy -= Math.sign(server_clients[i].vy + 0.000000001);
                    server_clients[i].grounded = true;
                }
            }

            for (j = 0; j < server_clients.length; j++) {
                if (i == j) {continue;}

                indexX = 0;
                while(rectanglesCentreAnchorOverlapping(server_clients[i].x + server_clients[i].vx, server_clients[i].y, playerWidth, playerHeight, server_clients[j].x, server_clients[j].y, playerWidth, playerHeight) && indexX < 100) {
                    indexX++;
                    server_clients[i].vx -= Math.sign(server_clients[i].vx + 0.000000001);
                }

                indexY = 0;
                while(rectanglesCentreAnchorOverlapping(server_clients[i].x, server_clients[i].y + server_clients[i].vy, playerWidth, playerHeight, server_clients[j].x, server_clients[j].y, playerWidth, playerHeight) && indexX < 100) {
                    indexY++;
                    server_clients[i].vy -= Math.sign(server_clients[i].vy + 0.000000001);
                    server_clients[i].grounded = true;
                }
            }

            if (server_clients[i].grounded) {
                server_clients[i].vy = 0;
            }

            server_clients[i].x += server_clients[i].vx;
            server_clients[i].y += server_clients[i].vy;

            server_io.emit('bb_pos', server_clients[i].x, server_clients[i].y, server_clients[i].id);
        }

    }

}, 1000 / FPS);

document.getElementById('host-button').onclick = function() {
    http.listen(3773, function() {
        console.log('listening on port:3773');
    });
    isHost = true;
    document.getElementById('join-button').onclick();
}

document.getElementById('start-game-button').onclick = function() {
    if (isHost) {
        currentGame = 'beatDown';
        server_io.emit('new_game_bb');
        console.log("ahhhhh");
    }
}

//Beatdown Boulevard
playerGravity = -0.7;
playerJumpForce = 19;
playerWidth = 48;
playerHeight = 48;
playerAccel = 1.1;
playerFriction = 0.9;

staticObjects = [
    {x: 0, y: -150, w: 600, h: 50, c:'#000'},
    {x: -250, y: 80, w:210, h: 50, c: '#000'},
    {x: 250, y: 80, w:210, h: 50, c: '#000'}
];



//Some physics
function rectanglesOverlapping(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function rectanglesCentreAnchorOverlapping(ax, ay, aw, ah, bx, by, bw, bh) {
    return rectanglesOverlapping(ax - aw / 2, ay - ah / 2, aw, ah, bx - bw / 2, by - bh / 2, bw, bh);
}