var express = require('express'), // Express framework for web applications http://expressjs.com/
    path = require('path'),
    Middleware = require("../middleware"),
    data = require('../data');

module.exports = function(app) {
    app.get("/login", function(req,res) {
        var login_module = {
            "success": true,
            "title": "Log in",
            "modules": [
                {
                    "type" : "html",
                    "title" : "Please input your e-mail and password.",
                    "content" : '<input type="email" class="admin fullwidth" placeholder="Email"><input type="password" class="admin fullwidth" placeholder="Password"> <button type="submit">Log in</button>',
                    "ord" : 1
                }
            ]
        };
        res.render("index", login_module);
    });
    app.all('/edit/*', Middleware.get_post, Middleware.get_module_ids, Middleware.get_modules, function(req,res) {
        console.log("EDIT");
        res.render('admin',req.post_info);
    });
    app.all('/', Middleware.authenticate, Middleware.get_all_posts, function(req,res) {
        res.render('admin', req.post_info)
    });
};