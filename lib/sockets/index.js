module.exports = function(server) {
    return require('socket.io')(server);
}