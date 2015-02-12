var express = require('express'),
    hbs = require('hbs'), // Express wrapper for Handlebars https://github.com/donpark/hbs
    path = require('path'),
    favicon = require('serve-favicon'),
    Admin = require("./admin"),
    io = require("./sockets"),
    data = require("./data"),
    apps = require("./apps"),
    Client = require("./client"),
    THUMS,
    init;

init = function () {
    var self = this;
    var app = self.app = express(),
        server = self.server = require('http').Server(app),
        admin = express();
    self.sockets = io(server);
    self.data = data;
    // Connect handlebars to Express
    app.set('view engine', 'hbs'); 
    app.set('views', path.join(__dirname + '/../views'));
    
    // Designate partials folder for handlebars
    hbs.registerPartials(path.join(__dirname,'/../views/partials'));
    
    // Static content including stylesheets and images
    try {
        app.use(favicon(path.join(__dirname + '/../views/assets/favicon.ico')));
    } catch (e){
        console.error(e, "Your theme does not have a favicon.")
    }
    app.use("/content",express.static(path.join(__dirname,"/../public")));
    Admin(admin);
    app.use('/admin', admin);
    Client(app);
    apps.load(function(app_list) {
        for (var x in app_list) {
            if (app_list[x].start) {
                app_list[x].start(self);
                console.log("Starting ",x);
            }
            if (app_list[x].module) {
                for (var i in app_list[x].reserve) {
                    apps.add_module(app_list[x].reserve[i],app_list[x].module)
                }
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