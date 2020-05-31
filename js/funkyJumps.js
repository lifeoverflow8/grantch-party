funkyJumps = {
    playerX: 700,
    playerY: 0,
    velocityY: 0,
    gravity: -0.7,
    jumpForce: 21,
    playerColor: '#afafaf',
    functions: [],
    gameTime: 0,
    start: function() {
        for (i = 0; i < clients.length; i ++) {
            clients[i].fj_pos_y = 0;
        }
        socket.on('fj_pos_y', function(y, id) {
            for (i = 0; i < clients.length; i++) {
                if (clients[i].id == id) {
                    clients[i].fj_pos_y = y;
                }
            }
        });

        socket.on('fj_pos_x', function(x, id) {
            if (id == ID) {
                funkyJumps.playerX = x;
            }
            for (i = 0; i < clients.length; i ++) {
                if (clients[i].id == id) {
                    clients[i].fj_pos_x = x;
                }
            }
        });
    },

    update: function() {
        this.gameTime++;

        if (input.w && !oldInputW && this.playerY == -150) {
            this.velocityY += this.jumpForce;
            //this.playerY ++;
        }
        oldInputW = input.w;

        if (input.s) {
            this.velocityY -= 1.4;
        }

        this.velocityY += this.gravity;
        this.playerY += this.velocityY;

        if (this.playerY < -150) {
            this.velocityY = 0;
            this.playerY = -150;
        }

        socket.emit('fj_pos_y', this.playerY, ID);
    },

    render: function() {
        ctx.fillStyle = '#abe3ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //Render the Player
        ctx.fillStyle = this.playerColor;
        width = 48;
        height = 48;
        ctx.fillRect(
            (canvas.width / 2 + this.playerX - width / 2),
            (canvas.height / 2 - this.playerY - height / 2),
            width,
            height
        );

        //Render the other players
        for (i = 0; i < clients.length; i++) {
            ctx.fillStyle = this.playerColor;
            ctx.fillRect(
                (canvas.width / 2 + clients[i].fj_pos_x - width / 2),
                (canvas.height / 2 - clients[i].fj_pos_y - height / 2),
                width,
                height,
            );
        }

        ctx.restore();
    },

    destroy: function() {

    }
}