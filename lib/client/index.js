var express = require('express'), // Express framework for web applications http://expressjs.com/
    path = require('path'),
    Middleware = require("../middleware"),
    data = require('../data'),
    api = require("../api");

module.exports = function(app) {

    app.use("/*", Middleware.session);
    app.all('/api/blog', Middleware.get_all_posts,Middleware.return_api);
    app.all('/api/*', Middleware.getPost, Middleware.return_api);
    app.all('/blog', Middleware.get_all_posts, Middleware.render);
    app.use('/*', Middleware.getPost, Middleware.load_apps);
    //app.get('/', Middleware.render);
    app.get("/", function(req,res,next) {
        if (! req.post_info["success"]) {
            req.post_info = {
                "id": 1,
                "slug": "",
                "parent": null,
                "title": "Welcome to THUMS",
                "featured": 1,
                "success": true,
                "modules": [{
                    "id": 1,
                    "type": "html",
                    "class": "module",
                    "title": "Welcome to THUMS",
                    "content": {"body":"We're still working on it, but it's getting there."},
                    "ord": null,
                    "html": true
                }]
            }
        }
        next();
    })
    app.get('/*', Middleware.render);

}