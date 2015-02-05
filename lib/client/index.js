var express = require('express'), // Express framework for web applications http://expressjs.com/
    path = require('path'),
    Middleware = require("../middleware"),
    data = require('../data');

module.exports = function(app) {
    
    
    app.use("/*", Middleware.session);
    app.all('/api/blog', Middleware.get_all_posts,Middleware.return_api);
    app.all('/api/page/*', Middleware.get_post, Middleware.get_module_ids, Middleware.get_modules, Middleware.return_api);
    app.all('/blog', Middleware.get_all_posts, Middleware.render);
    app.use('/*', Middleware.get_post, Middleware.get_module_ids, Middleware.get_modules);
    //app.get('/', Middleware.render);
    app.get('/*', Middleware.render);

}