"use strict";
var start = require("./start"),
    express = require('express'),
    path = require('path'),
    io = require("./sockets"),
    data = require("./data"),
    favicon = require('serve-favicon'),
    handlebars = require('./handlebars'),
    admin = require("./admin"),
    client = require("./client"),
    apps = require("./apps"),
    init;

init = function (cb) {
    var self = this;
    start(function (THUMS_data) {
        var admin_express = express();
        self.theme = THUMS_data.theme;
        self.app = express();
        self.serve = require('http').Server(self.app);
        self.sockets = io(self.serve);
        self.data = data;
        handlebars.loadPartials(self.theme.partials);
        handlebars.loadPages(self.theme.pages);
        console.log(self.theme.assets);
        try {
            self.app.use(favicon(path.join(__dirname + '/../public/favicon.ico')));
        } catch (e) {
            console.error(e, "Your theme does not have a favicon.");
        }
        self.app.engine('hbs', handlebars.engine);
        self.app.set('views', path.join(__dirname, "/../content/themes/", self.theme.name, 'pages'));
        self.app.set('view engine', 'hbs');
        self.app.use("/content", express.static(path.join(__dirname, "/../public")));
        admin(admin_express);
        self.app.use('/admin', admin_express);
        client(self.app);
        console.log("LOADING APPS");
        apps.load(function (app_list) {
            var x,
                i;
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
            self.serve.listen(process.env.PORT || 3000);
            console.log("THUMS is running on port", process.env.PORT || 3000);
            if (cb) {
                cb();
            }
        });
    });
};

module.exports = {
    init: init
}