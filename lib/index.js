"use strict";
var express = require('express'),
    hbs = require('hbs'), // Express wrapper for Handlebars https://github.com/donpark/hbs
    path = require('path'),
    favicon = require('serve-favicon'),
    startAdmin = require("./admin"),
    io = require("./sockets"),
    data = require("./data"),
    apps = require("./apps"),
    startClient = require("./client"),
    THUMS,
    init;

init = function () {
    var self = this,
        admin = express();
    self.app = express();
    self.server = require('http').Server(self.app);
    self.sockets = io(self.server);
    self.data = data;
    // Connect handlebars to Express
    self.app.set('view engine', 'hbs');
    self.app.set('views', path.join(__dirname + '/../views'));
    // Designate partials folder for handlebars
    hbs.registerPartials(path.join(__dirname, '/../views/partials'));
    // Static content including stylesheets and images
    try {
        self.app.use(favicon(path.join(__dirname + '/../views/assets/favicon.ico')));
    } catch (e) {
        console.error(e, "Your theme does not have a favicon.");
    }
    self.app.use("/content", express.static(path.join(__dirname, "/../public")));
    startAdmin(admin);
    self.app.use('/admin', admin);
    startClient(self.app);
    apps.load(function (app_list) {
        var x, i;
        for (x in app_list) {
            if (app_list.hasOwnProperty(x)) {
                if (app_list[x].start) {
                    app_list[x].start(self);
                    console.log("Starting ", x);
                }
                if (app_list[x].module) {
                    for (i in app_list[x].reserve) {
                        if (app_list[x].reserve.hasOwnProperty(i)) {
                            apps.add_module(app_list[x].reserve[i], app_list[x].module);
                        }
                    }
                }
            }
        }
        self.server.listen(80);
        console.log("Server running on port ", 80);
    });
};

THUMS = {
    init: init
};

module.exports = THUMS;