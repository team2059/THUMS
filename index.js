var app = require('express')(), // Express framework for web applications http://expressjs.com/
    hbs = require('hbs'), // Express wrapper for Handlebars https://github.com/donpark/hbs
    fs = require('fs'),
    path = require('path'),
    server = require('http').Server(app), // Start server with Express and http
    io = require('socket.io')(server), // Socket.io real-time engine http://socket.io/
    sqlite3 = require('sqlite3').verbose(), // SQLite3 database https://github.com/mapbox/node-sqlite3
    db = new sqlite3.Database('database.db'), // Create or connect to the database
    exec = require('child_process').exec,child; // Handle installing submodules

var serve_scripts = { "all" : [] },
    init = {"posts": [] }; // Used on server start

app.set('view engine', 'hbs'); // Connect handlebars to Express
hbs.registerPartials(__dirname+'/views/partials'); // Designate partials folder for handlebars

function add_post(data) {
    console.log("Initializing content for /"+data["slug"]);
    function check_post(slug,callback) {
        db.get("SELECT * FROM posts WHERE slug = $slug",{$slug : slug}, function(err,row) {
            if(!err) {
                if(!row) {
                    callback(row);
                } else {
                    callback(row);
                }
            }
        })
    }

    function insert_modules(post_id) {
        for (var i = 0; i < data["modules"].length; i++) {
            db.run("INSERT INTO modules (type,title,content,ord) VALUES (?,?,?,?)",data["modules"][i]["type"],data["modules"][i]["title"],data["modules"][i]["content"],data["modules"][i]["ord"], function(err,row) {
                db.run("INSERT INTO post_modules (post,module) VALUES ($post,$module)",{$post: post_id, $module: this["lastID"]})
            })
        }
    }

    function insert_post(data) {
        var stmt = db.prepare("INSERT INTO posts (slug,title) VALUES (?,?)");
        stmt.run(data["slug"],data["title"], function(err) {
            insert_modules(this["lastID"])
        });
    }
    check_post(data["slug"], function(row) {
        if (!row) {
            insert_post(data);
        } else {
            insert_modules(row.id);
        }
    })

}

function init_database(data,callback) {
    var done = false;
    for (var x = 0; x < data["database"]["tables"].length; x++) {
        var new_query = "CREATE table IF NOT EXISTS "+data["database"]["tables"][x]["name"]+" ("+data["database"]["tables"][x]["columns"].join(',')+")";
        db.run(new_query, function(err,row){
            if (callback && !done) {
                done = true;
                callback()
            }
        });
    }
}

function app_post_check(name,callback) {
    db.get("SELECT * FROM apps WHERE name = $name",{$name : name}, function(err,row) {
        if (!err) {
            if(row) {
                callback(false);
            } else {
                db.run("INSERT INTO apps (name) VALUES (?)",name);
                callback(true);
            }
        }
    })
}

function load_app(err,data){
    if (!err){
        data = JSON.parse(data);
        console.log(data["name"]);
        child = exec("cd apps && cd "+data["name"]+" && npm install --save && cd .. && cd ..",function(error, stdout, stderr) { 
            var new_mid = require( path.join(__dirname, "/apps/",data["name"]) );
            if (data["type"].indexOf("database") >= 0) {
                init_database(data,function() {
                    if (data["posts"]) {
                        app_post_check(data["name"], function(open) {
                            if(open) {
                                for (var i = 0; i < data["posts"].length; i++) {
                                    add_post(data["posts"][i]);
                                }
                            }
                        })
                    }
                    new_mid.database(db)
                });
            }
            if (data["type"].indexOf("sockets") >= 0) {
                io.on('connection',new_mid.extendSockets);
            }
            if (data["type"].indexOf("script") >= 0) {
                fs.readFile( path.join(__dirname,'/apps/',data["name"],'scripts.js') , function(err,script) {
                    for (var x = 0; x < data["path"].length; x++) {
                        if (!serve_scripts[data["path"][x]]) {
                            serve_scripts[data["path"][x]] = [];
                        }
                        serve_scripts[data["path"][x]].push(script.toString());
                    }
                });
            }
            //app.use(data["path"],new_mid);
        });

    }


    function get_all_posts(req,res,next) {
        if (req.post_info["slug"] !== "") {
            next();
        } else {
            db.all("SELECT * FROM posts WHERE parent IS NULL", function(err,row) {
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
        db.get("SELECT * FROM posts WHERE slug = $id AND parent "+is_null,{$id : post_id}, function(err,row) {
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
            db.all("SELECT * FROM post_modules WHERE post = $id",{$id : req.post_info["id"]}, function(err,row) {
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
            db.all("SELECT * FROM modules WHERE id ="+req.post_info["modules"].join(" OR id= ")+" ORDER by ord", function(err,row) {
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
    app.use('/*', get_post, get_all_posts, get_module_ids, get_modules);
    app.get('/',render);
    app.get('/*',render);
}

fs.readFile( path.join(__dirname,'config.json') , function(err,data){
    if (!err) {
        data = JSON.parse(data);
        console.log("Creating database");
        init_database(data, function() {
            fs.readdirSync( path.join(__dirname, "/apps/") ).forEach(function (file) {
                fs.readFile( path.join(__dirname,'/apps/',file,'config.json') , load_app);
            });
            if (data["posts"]) {
                app_post_check("THUMS",function(open) {
                    if(open) {
                        for (var i = 0; i < data["posts"].length; i++) {
                            add_post(data["posts"][i]);
                        }
                    }
                })
            }
        });
    }
});

try {
    server.listen(80);
    console.log("Server running on port 80");
} catch(e) {
    server.listen(3000);
    console.log("Server running on port 3000");
}