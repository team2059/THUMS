var express = require('express'),
    hbs = require('hbs'), // Express wrapper for Handlebars https://github.com/donpark/hbs
    path = require('path'),
    Admin = require("./admin"),
    io = require("./sockets"),
    data = require("./data"),
    apps = require("./apps"),
    Client = require("./client"),
    THUMS,
    init;

init = function () {
    var self = this;
    this.test = "TEST";
    var app = this.app = express(),
        server = this.server = require('http').Server(app),
        admin = express();
    this.sockets = io(server);

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
    apps.load(function(app_list) {
        for (x in app_list) {
            if (app_list[x].start) {
                app_list[x].start(self);
                console.log("Starting ",x);
            }
        }
        server.listen(80);
        console.log("Server running on port ",80);
    });
};

THUMS = {
    init: init
};

module.exports = THUMS;