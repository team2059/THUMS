var express = require('express'),
    hbs = require('hbs'), // Express wrapper for Handlebars https://github.com/donpark/hbs
    path = require('path'),
    Admin = require("./admin"),
    io = require("./sockets"),
    data = require("./data"),
    Client = require("./client"),
    THUMS,
    init;

init = function () {

    this.globals = {
        "hasUsers": null
    }
    var app = express(),
        admin = express(),
        
        // Start server with Express and http
        server = require('http').Server(app);
        
        // Socket.io real-time engine http://socket.io/
        io(server);
    
    // Connect handlebars to Express
    app.set('view engine', 'hbs'); 
    app.set('views', path.join(__dirname + '/../views'));
    
    // Designate partials folder for handlebars
    hbs.registerPartials(path.join(__dirname,'/../views/partials'));
    
    // Static content including stylesheets and images
    app.use("/content",express.static(path.join(__dirname,"/../public")));
    Admin(admin);
    app.use('/admin', admin);
    Client(app); 
    server.listen(80);
}

THUMS = {
    "globals": {
        "hasUsers": null
    },
    init: init
}

data.hasUser(function(count) {
    THUMS.globals.hasUsers = count;
});

module.exports = THUMS;