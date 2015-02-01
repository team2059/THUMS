var express = require('express'), // Express framework for web applications http://expressjs.com/
    Admin = require("./admin"),
    Client = require('./client');
    //fs = require('fs'),
    //path = require('path'),
    //exec = require('child_process').exec,child, // Handle installing submodules
    //Showdown = require('showdown'),
    //converter = new Showdown.converter(),
    //exec = require('child_process').exec, child; // Handle installing submodules

function init() {
    var app = express(),
        admin = express();
        var server = require('http').Server(app), // Start server with Express and http
        io = require('socket.io')(server); // Socket.io real-time engine http://socket.io/
    Admin(admin);
    app.use('/admin', admin);
    Client(app); 
    server.listen(80);
}

module.exports = init;