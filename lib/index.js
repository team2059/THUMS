var express = require('express'), // Express framework for web applications http://expressjs.com/
    Middleware = require('./middleware');
    //fs = require('fs'),
    //path = require('path'),
    //exec = require('child_process').exec,child, // Handle installing submodules
    //Showdown = require('showdown'),
    //converter = new Showdown.converter(),
    //exec = require('child_process').exec, child; // Handle installing submodules

function init() {
    var app = new express(),
        server = require('http').Server(app), // Start server with Express and http
        io = require('socket.io')(server); // Socket.io real-time engine http://socket.io/
    Middleware(app);
    server.listen(80);
}

module.exports = init;