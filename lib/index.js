var express = require('express'), // Express framework for web applications http://expressjs.com/
    Admin = require("./admin"),
    config = require("./config"),
    Client = require("./client");

function init() {
    config();
    var app = express(),
        admin = express(),
        server = require('http').Server(app), // Start server with Express and http
        io = require('socket.io')(server); // Socket.io real-time engine http://socket.io/
    Admin(admin);
    app.use('/admin', admin);
    Client(app); 
    server.listen(80);
}

module.exports = init;