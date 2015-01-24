var express = require('express'), // Express framework for web applications http://expressjs.com/
    path = require('path'),
    hbs = require('hbs'), // Express wrapper for Handlebars https://github.com/donpark/hbs
    data = require('../data');

module.exports = function(app) {
    
    var serve_scripts = { "all" : [] };
    

    app.set('view engine', 'hbs'); // Connect handlebars to Express
    hbs.registerPartials(path.join(__dirname,'../../views/partials')); // Designate partials folder for handlebars

    function get_all_posts(req,res,next) {
        if (!req.post_info) {
            req.post_info = {};
        }
        if (req.post_info["slug"] && req.post_info["slug"] !== "") {
            next();
        } else {
            data.getAllPosts(function(err,row) {
                if (!err) {
                    if (row) {
                        req.post_info["posts"] = row;
                        req.post_info["success"] = true;
                    } else {
                        req.post_info["success"] = false;
                    }
                    next();
                }
            })
        }
    }

    function get_post(req,res,next) {
        if(req.params[0].substr(-1) == '/') {
            req.params[0] =  req.params[0].substr(0, req.params[0].length - 1);
        }
        var is_null,
            post_id,
            parse_url = req.params[0].split('/');
        if (parse_url.length == 1) {
            is_null = "IS NULL";
            post_id = req.params[0];
        } else {
            is_null = "= '"+parse_url[0]+"'";
            post_id = parse_url[1]
        }
        data.getPostBySlug(post_id, function(err,row) {
            if (!err) {
                if (row) {
                    console.log(row);
                    req.post_info = row;
                    req.post_info["success"] = true;
                } else {
                    req.post_info = {};
                    req.post_info["success"] = false;
                }
                next();
            }
        })

    }

    function get_module_ids(req,res,next) {
        if (req.post_info["success"]) {
            req.post_info["modules"] = [];
            data.getPostModules(req.post_info["id"], function(err,row) {
                if (!err) {
                    for (var x = 0; x < row.length; x++) {
                        req.post_info["modules"].push(row[x]["module"]);
                    }
                    next()
                }
            })
        } else {
            next();
        }
    }

    function get_modules(req,res,next) {
        if (req.post_info["success"]) {
            data.getModulesById(req.post_info["modules"], function(err,row) {
                if (!err) {
                    req.post_info["modules"] = row;
                    next();
                }
            })
        } else {
            next();
        }
    }

    function return_api(req,res){
        if (serve_scripts[req.route.path]) {
            req.post_info["script"] = serve_scripts[req.route.path];
        } else if (serve_scripts[req.url]) {
            req.post_info["script"] = serve_scripts[req.url];
        }
        res.json(req.post_info);
    }

    function render(req,res) {
        if (serve_scripts[req.route.path]) {
            req.post_info["script"] = serve_scripts[req.route.path];
        } else if (serve_scripts[req.url]) {
            req.post_info["script"] = serve_scripts[req.url];
        }
        res.render('index',req.post_info);
    }
    app.all('/api/blog', get_all_posts,return_api);
    app.all('/api/page/*', get_post, get_all_posts, get_module_ids, get_modules,return_api);
    app.all('/blog', get_all_posts,render);
    app.all('/admin/*/edit', get_post, get_module_ids, get_modules, function(req,res) {
        res.render('admin',req.post_info);
    });
    app.all('/admin', get_all_posts, function(req,res) {
        res.render('admin', req.post_info)
    });
    app.use('/*', get_post, get_all_posts, get_module_ids, get_modules);
    app.get('/',render);
    app.get('/*',render);

}