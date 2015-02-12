var express = require('express'), // Express framework for web applications http://expressjs.com/
    path = require('path'),
    cookie = require('cookie'),
    uuid = require('node-uuid'),
    data = require('../data'),
    apps = require("../apps"),
    api = require("../api"),
    session,
    get_all_posts,
    authenticate,
    getPost,
    return_api,
    load_apps,
    render,
    new_date;

var serve_scripts = { "all" : [] };

session = function (req,res,next) {
    new_date = new Date();
    if (! req.headers.cookie) {
        res.cookie("session", uuid.v1(), {httpOnly: true, maxAge: 1000000000});
    }
    next();
}

authenticate = function(req,res,next) {
    var session = cookie.parse(req.headers.cookie).session;
    data.ifSession(session, function(err,bool) {
        if (bool) {
            next();
        } else {
            res.status(403).send('Unauthorized.');
        }
    })
}

get_all_posts = function(req,res,next) {
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

load_apps = function(req,res,next) {
    var root = req.originalUrl.split("/")[1];
    var app_modules = apps.get_modules(root);
    if (app_modules) {
        if (req.post_info.success !== true) {
            req.post_info.success = true;
        }
        if (!req.post_info.modules) {
            req.post_info.modules = [];
        }
        for (var i = 0; i < app_modules.length;) {
            app_modules[i](req, res, function () {
                i++;
            })
        }
    }
    next();
};

return_api = function(req,res){
    if (serve_scripts[req.route.path]) {
        req.post_info["script"] = serve_scripts[req.route.path];
    } else if (serve_scripts[req.url]) {
        req.post_info["script"] = serve_scripts[req.url];
    }
    res.json(req.post_info);
}

render = function(req,res) {
    if (serve_scripts[req.route.path]) {
        req.post_info["script"] = serve_scripts[req.route.path];
    } else if (serve_scripts[req.url]) {
        req.post_info["script"] = serve_scripts[req.url];
    }
    res.render('index',req.post_info);
    console.log(new Date() - new_date,"ms");
}

getPost = function(req,res,next){
    if(req.params[0].substr(-1) == '/') {
        req.params[0] =  req.params[0].substr(0, req.params[0].length - 1);
    }
    var parse_url = req.params[0].split('/');
    api.fetchPost(parse_url).then(function(info){
        req.post_info = info;
        next();
    })
};

module.exports = {
    session: session,
    authenticate: authenticate,
    get_all_posts: get_all_posts,
    getPost: getPost,
    load_apps: load_apps,
    return_api: return_api,
    render: render
}