var server = require('./lib');

server();


/*

function (data) {
    console.log("Initializing content for /"+data["slug"]);


    function insert_modules(post_id) {
        for (var i = 0; i < data["modules"].length; i++) {
            db.run("INSERT INTO modules (type,title,content,ord) VALUES (?,?,?,?)",data["modules"][i]["type"],data["modules"][i]["title"],data["modules"][i]["content"],data["modules"][i]["ord"], function(err,row) {
                db.run("INSERT INTO post_modules (post,module) VALUES ($post,$module)",{$post: post_id, $module: this["lastID"]})
            })
        }
    }


    getPostBySlug(data["slug"], function(row) {
        if (!row) {
            insert_post(data);
        } else {
            insert_modules(row.id);
        }
    })

function load_app(err,data){
    if (!err){
        data = JSON.parse(data);
        console.log(data["name"]);
        child = exec("cd .. && cd apps && cd "+data["name"]+" && npm install --save && cd .. && cd .. && cd lib",function(error, stdout, stderr) { 
            var new_mid = require( path.join(__dirname, "../apps/",data["name"]) );
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
                fs.readFile( path.join(__dirname,'../apps/',data["name"],'scripts.js') , function(err,script) {
                    for (var x = 0; x < data["path"].length; x++) {
                        if (!serve_scripts[data["path"][x]]) {
                            serve_scripts[data["path"][x]] = [];
                        }
                        serve_scripts[data["path"][x]].push(script.toString());
                    }
                });
            }
        });

    }
*/  
