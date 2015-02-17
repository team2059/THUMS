var path = require('path'),
    cookie = require('cookie'),
    uuid = require('node-uuid'),
    data = require('../data'),
    apps = require("../apps"),
    get_all_posts,
    get_post,
    get_module_ids,
    get_modules,
    return_api,
    load_apps,
    render,
    new_date;

var serve_scripts = { "all" : [] };

get_all_posts = function(req,res,next) {
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

get_post = function(parse_url,post_info,cb) {
    var is_null,
        post_id;
    if (parse_url.length == 1) {
        is_null = "IS NULL";
        post_id = parse_url[0];
    } else {
        is_null = "= '"+parse_url[0]+"'";
        post_id = parse_url[1]
    }
    data.getPostBySlug(post_id, function(err,row) {
        if (!err) {
            if (row) {
                post_info = row;
                post_info["success"] = true;
                post_info["modules"] = [];
                post_info["modules"].push(row.featured);
            } else {
                post_info["success"] = false;
            }
            cb(null,post_info);
        } else {
            cb(err);
        }
    })

}

get_module_ids = function(post_info,cb) {
    if (post_info["success"]) {
        data.getPostModules(post_info["id"], function(err,row) {
            if (!err) {
                var x,
                    module_list = [];
                for (x in row) {
                    if (row.hasOwnProperty(x)) {
                        if (row[x].hasOwnProperty('module')) {
                            module_list.push(row[x]["module"]);
                        }
                    }
                }
                post_info["modules"] = module_list;
                cb(null,post_info);
            } else{
                cb(err);
            }
        })
    } else {
        cb(null,post_info);
    }
}

get_modules = function(post_info,cb) {
    if (post_info["success"] && post_info["modules"]) {
        data.getModulesById(post_info["modules"], function(err,row) {
            if (!err) {
                var x;
                for (x in row) {
                    row[x][row[x]["type"]] = true;
                    // TODO: Convert to featured.
                    /*if (row[x]["content"]) {
                        row[x]["content"] = JSON.parse(row[x]["content"]);
                    }*/
                    if (row[x]["id"] === post_info.featured) {
                        row[x]["title"] = post_info.title;
                    }
                }
                post_info["modules"] = row;
                cb(null,post_info);
            } else {
                cb(err);
            }
        })
    } else {
        cb(null,post_info)
    }
}

load_apps = function(req,res,next) {
    console.log("URL IS",req.originalUrl);
    var root = req.originalUrl.split("/")[1];
    var app_modules = apps.get_modules(root);
    if (app_modules) {
        for (var i = 0; i < app_modules.length;) {
            console.log(i)
            console.log(app_modules[i])
            app_modules[i](req, res, function () {
                i++;
            })
        }
    }
    next();
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
    console.log(new Date() - new_date,"ms");
    if (serve_scripts[req.route.path]) {
        req.post_info["script"] = serve_scripts[req.route.path];
    } else if (serve_scripts[req.url]) {
        req.post_info["script"] = serve_scripts[req.url];
    }
    res.render('index',req.post_info);
}

module.exports = {
    get_all_posts: get_all_posts,
    get_post: get_post,
    get_module_ids: get_module_ids,
    get_modules: get_modules,
    load_apps: load_apps,
    return_api: return_api,
    render: render
}