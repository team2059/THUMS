var express = require('express'), // Express framework for web applications http://expressjs.com/
    path = require('path'),
    hbs = require('hbs'), // Express wrapper for Handlebars https://github.com/donpark/hbs
    Middleware = require("../middleware"),
    data = require('../data');

module.exports = function(app) {
    
    app.set('view engine', 'hbs'); // Connect handlebars to Express
    
    app.set('views', path.join(__dirname + '/../../content/themes/print'));
    hbs.registerPartials(path.join(__dirname,'/../../content/themes/print/partials')); // Designate partials folder for handlebars

    app.all('/api/blog', Middleware.get_all_posts,Middleware.return_api);
    app.all('/api/page/*', Middleware.get_post, Middleware.get_all_posts, Middleware.get_module_ids, Middleware.get_modules, Middleware.return_api);
    app.all('/blog', Middleware.get_all_posts, Middleware.render);
    app.use('/*', Middleware.get_post, Middleware.get_module_ids, Middleware.get_modules);
    app.get('/', Middleware.get_all_posts, Middleware.render);
    app.get('/*', Middleware.render);

}