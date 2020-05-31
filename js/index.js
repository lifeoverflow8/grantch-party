var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var socket = null;
clients = [];
ID = -1;
nickname = "client_anon";
orderID = -1;

zoomX = 1;
zoomY = 1;
camX = 0;
camY = 0;

input = {
    w: false,
    a: false,
    s: false,
    d: false
}

document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    switch(event.keyCode) {
        case 87:
            input.w = true;
            break;
        
        case 65:
            input.a = true;
            break;

        case 83:
            input.s = true;
            break;

        case 68:
            input.d = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    const keyName = event.key;

    switch (event.keyCode) {
        case 87:
                input.w = false;
                break;
    
            case 65:
                input.a = false;
                break;
    
            case 83:
                input.s = false;
                break;
    
            case 68:
                input.d = false;
                break;
    }
});

mouseX = 0;
mouseY = 0;

window.addEventListener('mousemove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

window.addEventListener('wheel', event => {
    zoomX -= event.deltaY / 120 / 8;
    zoomY -= event.deltaY / 120 / 8;
});

setInterval(function() {
    update();
    render();
}, 1000/60);

currentScene = mainMenu;

currentScene.start();

function update() {
    currentScene.update();
}

function render() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    currentScene.render();
}

document.getElementById('join-button').onclick = function() {
    socket = io.connect("http://localhost:3773");
    socket.on('id', function(id) {
        ID = id;
        socket.emit('nickname', ID, nickname);
    });

    socket.on('old_clients', function(inc_clients) {
        clients = inc_clients;
    });

    socket.on('new_client', function(id) {
        if (id != ID) {
            clients.push({id: id});
        }
    });

    socket.on('disconnect', function(id) {
        for (i = 0; i < clients.length; i ++) {
            if (clients[i].id == id) {
                clients.splice(i, 1);
            }
        }
    });

    changeScene(funkyJumps);
}

function changeScene(newScene) {
    currentScene.destroy();

    currentScene = newScene;
    currentScene.start();
}

//Physics
function rectanglesOverlapping(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}