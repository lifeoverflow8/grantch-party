document.getElementById('play-button').onclick = function() {
    document.getElementById('host-button').style.display = 'block';
    document.getElementById('join-button').style.display = 'block';
    document.getElementById('play-button').style.display = 'none';
}

mainMenu = {
    start: function() {
    },

    update: function() {

    },

    render: function() {
        ctx.fillStyle = '#ffbf00';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    destroy: function() {
        document.getElementById('play-button').style.display = 'none';
        document.getElementById('host-button').style.display = 'none';
        document.getElementById('join-button').style.display = 'none';
        document.getElementById('title').style.display = 'none';
        document.getElementById('local-ip').style.display = 'none';
        document.getElementById('ip-text').style.display = 'none';
        document.getElementById('ip-address-input').style.display = 'none';
    }
}