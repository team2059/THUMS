var express = require('express'), // Express framework for web applications http://expressjs.com/
    path = require('path'),
    Middleware = require("../middleware"),
    data = require('../data');

module.exports = function(app) {

    app.all('/edit/*', Middleware.get_post, Middleware.get_module_ids, Middleware.get_modules, function(req,res) {
        console.log("EDIT");
        res.render('admin',req.post_info);
    });
    app.all('/', Middleware.get_all_posts, function(req,res) {
        res.render('admin', req.post_info)
    });
}