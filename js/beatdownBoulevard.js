beatDown = {
    playerX: 0,
    playerY: 0,
    staticObjects: [
        {x: 0, y: -150, w: 600, h: 50, c:'#000'},
        {x: -250, y: 80, w:210, h: 50, c: '#000'},
        {x: 250, y: 80, w:210, h: 50, c: '#000'}
    ],
    start: function() {
        oldInputW = false;

        socket.on('bb_pos', function(x, y, id) {
            if (id == ID) {
                beatDown.playerX = x;
                beatDown.playerY = y;
            }

            for (i = 0; i < clients.length; i++) {
                if (clients[i].id == id) {
                    clients[i].x = x;
                    clients[i].y = y;
                }
            }
        });
    },

    update: function() {
        if (input.d) {
            socket.emit('bb_right');
        }

        if (input.a) {
            socket.emit('bb_left');
        }

        if (input.w && !oldInputW) {
            socket.emit('bb_jump');
        }
        oldInputW = input.w;
    },

    render: function() {
        ctx.fillStyle = '#ffe3e3';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //render all the platforms
        for (i = 0; i < this.staticObjects.length; i++) {
            ctx.fillStyle = this.staticObjects[i].c;
            ctx.fillRect(canvas.width / 2 + this.staticObjects[i].x - this.staticObjects[i].w / 2, canvas.height / 2 - this.staticObjects[i].y - this.staticObjects[i].h / 2, this.staticObjects[i].w, this.staticObjects[i].h);
        }

        //Render all of the other players
        for (i = 0; i < clients.length; i++) {
            ctx.fillStyle = '#f00';
            ctx.fillRect(canvas.width / 2 + clients[i].x - 24, canvas.height / 2 - clients[i].y - 24, 48, 48);
        } 

        //ah player yes
        ctx.fillStyle = '#f00';
        ctx.fillRect(canvas.width / 2 + this.playerX - 24, canvas.height / 2 - this.playerY - 24, 48, 48);
    },

    destroy: function() {

    }
}