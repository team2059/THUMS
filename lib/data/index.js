var sqlite3 = require('sqlite3').verbose(), // SQLite3 database https://github.com/mapbox/node-sqlite3
    db = new sqlite3.Database('database.db'), // Create or connect to the database
    createTable,
    getPostBySlug,
    getAllPosts,
    addPost,
    getPostModules,
    getModulesById,
    getModuleById,
    addModulesAndPost,
    getAppByName,
    addAppByName,
    getUser,
    ifSession;

// Database functions

createTable = function (obj,callback) {
    var new_query = "CREATE table IF NOT EXISTS "+obj.name+" ("+obj.columns.join(',')+")";
    db.run(new_query, callback);
}

// Post functions

getPostBySlug = function (slug,callback) {
    db.get("SELECT * FROM posts WHERE slug = $slug",{$slug : slug}, callback)
}

getAllPosts = function (callback) {
    db.all("SELECT * FROM posts WHERE parent IS NULL", callback)
}


addPost = function (obj,callback) {
    db.run("INSERT INTO posts (slug,title) VALUES (?,?)",obj.slug,obj.title, callback);
}

// Module functions

getPostModules = function (id,callback) {
    db.all("SELECT * FROM post_modules WHERE post = $id",{$id : id}, callback)
}

getModulesById = function (obj,callback) {
    db.all("SELECT * FROM modules WHERE id ="+obj.join(" OR id= ")+" ORDER by ord", callback)
}

getModuleById = function (id,callback) {
    db.get("SELECT * FROM modules WHERE id = $id", {$id : id}, callback)
}

addModulesAndPost = function (obj,id,callback) {
    db.run("INSERT INTO modules (type,title,content,ord) VALUES (?,?,?,?)",obj.type,obj.title,obj.content,data.ord, function(err,row) {
        if (!err) {
            db.run("INSERT INTO post_modules (post,module) VALUES ($post,$module)",{$post: id, $module: this["lastID"]}, callback)
        }
    })
}

// App functions

getAppByName = function (name,callback) {
    db.get("SELECT * FROM apps WHERE name = $name",{$name : name}, callback)
}

addAppByName = function (name,callback) {
    db.run("INSERT INTO apps (name) VALUES (?)",name,callback)
}

getUser = function (username, password, callback) {
    db.get("SELECT id from users WHERE username = $username AND password = $password", {$username: username, $password: password}, function (err, row) {
      if (err) {
          callback(err);
      } else if (!row) {
          callback(null, false);
      } else {
          callback(null, row);
      }
    })
}

ifSession = function (session,callback) {
    db.get("SELECT * FROM sessions WHERE session = $session",{$session : session}, function(err,row) {
        if (err) {
            callback(err);
        } else if (row) {
            callback(null,true);
        } else {
            callback(null,false);
        }
    })
}


module.exports = {
    createTable: createTable,
    getPostBySlug: getPostBySlug,
    getAllPosts: getAllPosts,
    addPost: addPost,
    getPostModules: getPostModules,
    getModulesById: getModulesById,
    getModuleById: getModuleById,
    addModulesAndPost: addModulesAndPost,
    getAppByName: getAppByName,
    addAppByName: addAppByName,
    getUser: getUser,
    ifSession: ifSession
}

