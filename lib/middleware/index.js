var express = require('express'), // Express framework for web applications http://expressjs.com/
    path = require('path'),
    cookie = require('cookie'),
    uuid = require('node-uuid'),
    data = require('../data'),
    session,
    get_all_posts,
    get_post,
    get_module_ids,
    get_modules,
    return_api,
    render;

var serve_scripts = { "all" : [] };

session = function (req,res,next) {
    if (! req.headers.cookie) {
        res.cookie("session", uuid.v1(), {httpOnly: true, maxAge: 1000000000});
    } else {
        console.log(cookie.parse(req.headers.cookie));
        console.log(req.headers["user-agent"]);
        console.log(req.connection.remoteAddress);
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

get_post = function(req,res,next) {
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
                req.post_info["modules"] = [];
                req.post_info["modules"].push(row.featured);
            } else {
                req.post_info = {};
                req.post_info["success"] = false;
            }
            next();
        }
    })

}

get_module_ids = function(req,res,next) {
    if (req.post_info["success"]) {
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

get_modules = function(req,res,next) {
    if (req.post_info["success"] && req.post_info["modules"]) {
        data.getModulesById(req.post_info["modules"], function(err,row) {
            if (!err) {
                for (x in row) {
                    row[x][row[x]["type"]] = true;
                    console.log(row[x]["content"]);
                    if (row[x]["content"]) {
                        row[x]["content"] = JSON.parse(row[x]["content"]);
                    }
                    if (row[x]["id"] === req.post_info.featured) {
                        row[x]["title"] = req.post_info.title;
                    }
                }
                req.post_info["modules"] = row;
                next();
            }
        })
    } else {
        next();
    }
}

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
}

module.exports = {
    session: session,
    authenticate: authenticate,
    get_all_posts: get_all_posts,
    get_post: get_post,
    get_module_ids: get_module_ids,
    get_modules: get_modules,
    return_api: return_api,
    render: render
}