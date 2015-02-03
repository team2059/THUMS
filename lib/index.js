var express = require('express'),
    hbs = require('hbs'), // Express wrapper for Handlebars https://github.com/donpark/hbs
    path = require('path'),
    Admin = require("./admin"),
    Client = require("./client");

function init() {
    var app = express(),
        admin = express(),
        
        // Start server with Express and http
        server = require('http').Server(app), 
        
        // Socket.io real-time engine http://socket.io/
        io = require('socket.io')(server); 
    app.set('view engine', 'hbs'); // Connect handlebars to Express
    app.set('views', path.join(__dirname + '/../views'));
    hbs.registerPartials(path.join(__dirname,'/../views/partials')); // Designate partials folder for handlebars
    app.use("/content",express.static(path.join(__dirname,"/../public")));
    Admin(admin);
    app.use('/admin', admin);
    Client(app); 
    server.listen(80);
}

module.exports = init;