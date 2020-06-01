lobby = {
    start: function() {
        document.getElementById('lobby-title').style.display = 'block';
        document.getElementById('start-game-button').style.display = 'block';
    },

    update: function() {

    },

    render: function() {
        ctx.fillStyle = '#ffefca';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    destroy: function() {
        document.getElementById('lobby-title').style.display = 'none'; 
        document.getElementById('start-game-button').style.display = 'none';
    }
}