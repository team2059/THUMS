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

init = function (cb) {
    var self = this;
    var app = self.app = express(),
        admin = express();
    self.serve = require('http').Server(app);
    self.sockets = io(self.serve);
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
        //TODO: Create method of setting port.
        self.serve.listen(process.env.PORT || 3000);
        console.log("Server running on port ",process.env.PORT || 3000);
        if(cb) {
            cb();
        }
    });
};

THUMS = {
    init: init
};

module.exports = THUMS;