"use strict";
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
    hasUser,
    ifSession;

// Database functions

/**
 * Check if a table exists and create on if it does not.
 * This helps prevent errors by calling a table that does not exist.
 * @param {Object} obj - An object that contains instructions for the new database.
 * @param {string} obj.name - The name for the new database table.
 * @param {Object[]} obj.columns - An array of the new columns.
 * @param {function} callback - Returns an error if one occurs.
 */
createTable = function (obj, callback) {
    var new_query = "CREATE table IF NOT EXISTS " + obj.name + " (" + obj.columns.join(',') + ")";
    db.run(new_query, callback);
};

// Post functions

/**
 * Fetch the post from the database if it exists.
 * @param {string} slug - The path of the post request.
 * @param {function} callback - Returns the post information.
 */
getPostBySlug = function (slug, callback) {
    db.get("SELECT * FROM posts WHERE slug = $slug", {$slug : slug}, callback);
};

/**
 * Fetch all posts from the database
 * @param {function} callback
 */
getAllPosts = function (callback) {
    //TODO: add a limit.
    db.all("SELECT * FROM posts WHERE parent IS NULL", callback);
};

/**
 * Create a new post.
 * @param {Object} obj
 * @param {string} obj.slug - The URL slug.
 * @param {string} obj.title - The post title.
 * @param {function} callback
 */
addPost = function (obj, callback) {
    db.run("INSERT INTO posts (slug,title) VALUES (?,?)", obj.slug, obj.title, callback);
};

// Module functions

/**
 * Fetch a list of module IDs for a given post.
 * @param id - The post ID.
 * @param {function} callback
 */
getPostModules = function (id, callback) {
    db.all("SELECT * FROM post_modules WHERE post = $id", {$id : id}, callback);
};

/**
 * Fetch all modules that match an array of IDs.
 * @param {Object[]} obj - A list of IDs.
 * @param {function} callback
 */
getModulesById = function (obj, callback) {
    db.all("SELECT * FROM modules WHERE id =" + obj.join(" OR id= ") + " ORDER by ord", callback);
};

/**
 * Fetch a single module with a given id
 * @param id
 * @param {function} callback
 */
getModuleById = function (id, callback) {
    db.get("SELECT * FROM modules WHERE id = $id", {$id : id}, callback);
};

/**
 * Create a new module entry and attach it to a given post.
 * @param {Object} obj
 * @param id - The corresponding post ID.
 * @param {function} callback
 */
addModulesAndPost = function (obj, id, callback) {
    db.run("INSERT INTO modules (type,title,content,ord) VALUES (?,?,?,?)", obj.type, obj.title, obj.content, obj.ord, function (err) {
        if (!err) {
            db.run("INSERT INTO post_modules (post,module) VALUES ($post,$module)", {$post: id, $module: this.lastID}, callback);
        }
    });
};

// App functions

/**
 * Check if an app is in the database.
 * @param {string} name
 * @param {function} callback
 */
getAppByName = function (name, callback) {
    db.get("SELECT * FROM apps WHERE name = $name", {$name : name}, callback);
};

/**
 * Add an app to the database.
 * @param {string} name
 * @param {function} callback
 */
addAppByName = function (name, callback) {
    db.run("INSERT INTO apps (name) VALUES (?)", name, callback);
};

/**
 * Authenticate a user.
 * @param {string} username
 * @param {string} password
 * @param {function} callback
 */
getUser = function (username, password, callback) {
    //TODO: salt the passwords
    db.get("SELECT id from users WHERE username = $username AND password = $password", {$username: username, $password: password}, function (err, row) {
        if (err) {
            callback(err);
        } else if (!row) {
            callback(null, false);
        } else {
            callback(null, row);
        }
    });
};

/**
 * Check if there are any registered users.
 * @param {function} callback
 */
hasUser = function (callback) {
    db.get("SELECT count(*) as number FROM users", function (err, row) {
        if (err) {
            callback(false);
        } else {
            if (row) {
                console.log(row);
                if (row.number) {
                    if (row.number === 0) {
                        callback(true);
                    }
                }
            }
            callback(false);
        }
    });
};

/**
 * Authenticate a session.
 * @param {string} session - A session ID.
 * @param {function} callback
 */
ifSession = function (session, callback) {
    db.get("SELECT * FROM sessions WHERE session = $session", {$session : session}, function (err, row) {
        if (err) {
            callback(err);
        } else if (row) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
};

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
    hasUser: hasUser,
    ifSession: ifSession,
    db: db
};

