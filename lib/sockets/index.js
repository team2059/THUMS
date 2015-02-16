/**
 * Create a new socket.io instance.
 * @param server
 * @returns {*|exports}
 */
"use strict"
var socket_io = require('socket.io');

module.exports = function (server) {
    return socket_io(server);
}