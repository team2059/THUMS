"use strict";
var Promise = require('bluebird'),
    promiseFunctions = require("../promises"),
    handlebars = require('../handlebars'),
    npm = Promise.promisifyAll(require('npm')),
    path = require('path'),
    processFiles = Promise.promisifyAll(require('../process')),
//apps = require('../apps'),
    data = Promise.promisifyAll(require('../data')),
    npm_installed = false,
    begin,
    THUMS_data,
    theme_path;

begin = Promise.promisify(function (callback) {
    console.log("Starting the server.");
    callback(null);
});

function getDatabaseTableNames() {
    return data.getTablesAsync().catch(function (e) {
        console.error("Could not read table names.");
    });
}

function getNonexistentTables(options) {
    return getDatabaseTableNames().then(function (tables) {
        var nonexistent_tables = [],
            x;
        for (x in options) {
            if (options.hasOwnProperty(x)) {
                if (tables.indexOf(options[x].name) < 0) {
                    nonexistent_tables.push(options[x]);
                }
            }
        }
        return nonexistent_tables;
    });
}

function getNonexistentTablesFromConfigFile(filePath) {
    return promiseFunctions.readJSON(filePath).then(function (options) {
        return getNonexistentTables(options.database.tables);
    });
}

function addMissingDatabaseTables(options) {
    if (options.length > 0) {
        var x;
        for (x in options) {
            if (options.hasOwnProperty(x)) {
                data.createTable(options[x]);
            }
        }
    }
    return;
}

function getTheme(theme_path) {
    var theme_info = {};
    return promiseFunctions.getDir(theme_path).each(function (path_name) {
        switch (path.basename(path_name)) {
        case "assets":
            return promiseFunctions.readAssetsFolder(path_name).then(function (files) {
                theme_info.assets = files;
            });
        case "pages":
            return promiseFunctions.readHandlebarsFolder(path_name).then(function (partials) {
                theme_info.pages = partials;
            });
        case "partials":
            return promiseFunctions.readHandlebarsFolder(path_name).then(function (partials) {
                theme_info.partials = partials;
            });
        default:
            break;
        }
    }).then(function () {
        return theme_info;
    });
}

function compileThemeStylesheet(theme_path, assets) {
    if (assets.indexOf("style.less") >= 0) {
        promiseFunctions.readFile(path.join(theme_path, "assets/style.less")).then(function (string) {
            return processFiles.compileLessAsync(string).then(function (css) {
                promiseFunctions.writeFile(path.join(__dirname, '../../public/style.css'), css);
            });
        });
    }
}

function minifyThumsClient(array) {
    var minified_js = processFiles.minifyJavaScript(array);
    return promiseFunctions.writeFile(path.join(__dirname, '../../public/thums.min.js'), minified_js);
}

function processAssets(asset_path, assets, cb) {
    var x,
        file,
        scripts = [];
    for (x in assets) {
        if (assets.hasOwnProperty(x)) {
            file = path.join(asset_path, assets[x]);
            switch (path.extname(file)) {
            case '.js':
                scripts.push(file);
                break;
            default:
                promiseFunctions.readAndWrite(file, path.join(__dirname, '../../public/', assets[x]));
                break;
            }
        }
    }
    scripts.push(path.join(__dirname, "../../public/thums.js"));
    cb(null, scripts);
}

function processPathable(file, obj) {
    return new Promise(function (resolve, reject) {
        if (typeof obj === 'string') {
            if (obj.indexOf('@app') >= 0) {
                var process_type;
                if (obj.indexOf('.json') >= 0) {
                    process_type = promiseFunctions.readJSON;
                } else {
                    process_type = promiseFunctions.readFile;
                }
                process_type(path.join(file, obj.replace('@app', ''))).then(function (module_data) {
                    resolve(module_data);
                }).catch(function (e) {
                    reject(e);
                });
            }
        } else {
            resolve(obj);
        }
    });
}

function loadPost(file, options) {
    data.getPostBySlug(options.slug, function (err, row) {
        if (err) {
            return console.error(err);
        }
        if (row) {
            return;
        }
        console.log(options);
        processPathable(file, options.modules).then(function (obj) {
            options.modules = obj;
            return obj;
        }).map(function (obj) {
            return processPathable(file, obj.content).then(function (content) {
                obj.content = content;
                return obj;
            });
        }).then(function (test) {
            options.modules = test;
            return data.addPostModulesAsync(options);
        });
    });
}

function loadPosts(file, options) {
    var x;
    for (x in options) {
        if (options.hasOwnProperty(x)) {
            loadPost(file, options[x]);
        }
    }
}


function loadApps() {
    return promiseFunctions.getDir(path.join(__dirname, "../../content/apps")).map(function (file) {
        return promiseFunctions.readJSON(path.join(file, 'package.json')).then(function (pack) {
            if (pack.hasOwnProperty("THUMS-Tables")) {
                getNonexistentTables(pack["THUMS-Tables"]).then(function (tables) {
                    addMissingDatabaseTables(tables);
                });
            }
            if (pack.hasOwnProperty("THUMS-Posts")) {
                loadPosts(file, pack["THUMS-Posts"]);
            }
            return pack;
        }).then(function (pack) {
            return promiseFunctions.ensureExists(path.join(file, 'node_modules')).then(function () {
                return promiseFunctions.getDir(path.join(file, 'node_modules')).then(function (modules) {
                    var x, i,
                        packages = Object.keys(pack.dependencies),
                        versions = pack.dependencies,
                        to_install,
                        install_queue = [];
                    for (x in modules) {
                        if (modules.hasOwnProperty(x)) {
                            modules[x] = path.basename(modules[x]);
                        }
                    }
                    if (pack.dependencies) {
                        for (i in packages) {
                            if (packages.hasOwnProperty(i)) {
                                if (modules.indexOf(packages[i]) < 0) {
                                    to_install = packages[i] + "@" + versions[packages[i]];
                                    install_queue.push(to_install);
                                }
                            }
                        }
                    }
                    return install_queue;
                }).then(function (queue) {
                    if (queue.length > 0) {
                        return npm.loadAsync().then(function () {
                            npm.commands.install(file, queue, function (err) {
                                npm_installed = true;
                            });
                            return queue;
                        });
                    }
                    npm_installed = true;
                    return queue;
                });
            });
        });
    }).reduce(function (a, b) {
        return a.concat(b);
    }, []);
}

function installFinished(callback) {
    var timer = 0;
    console.log("Installing dependencies...");
    function wait() {
        if (npm_installed || timer > 60) {
            if (!npm_installed) {
                console.log("Timed out.");
            }
            callback(null, true);
        } else {
            timer += 1;
            setTimeout(wait, 1000);
        }
    }
    wait();
}


function checkDatabase() {
    return getNonexistentTablesFromConfigFile(path.join(__dirname, 'config.json')).then(addMissingDatabaseTables);
}

module.exports = function (callback) {
    THUMS_data = {};
    begin().then(checkDatabase)
        .then(function () {

            // Load theme.
            // TODO: Load theme from the database.
            var theme_name = "print";
            theme_path = path.join(__dirname, "../../content/themes", theme_name);
            return getTheme(theme_path).then(function (x) {
                THUMS_data.theme = x;
                THUMS_data.theme.name = theme_name;
                return compileThemeStylesheet(theme_path, THUMS_data.theme.assets);
            });
        }).then(function () {
            return loadApps().then(function (to_do) {
                if (to_do.length < 1) {
                    npm_installed = true;
                }
                installFinished = Promise.promisify(installFinished);
                return installFinished().then(function () {
                    processAssets(path.join(theme_path, 'assets'), THUMS_data.theme.assets, function (err, scripts) {
                        THUMS_data.theme.scripts = scripts;
                        handlebars.loadModules(THUMS_data.theme.partials.modules, function (err, data) {

                            // Move essential scripts to the public directory.
                            promiseFunctions.writeFile(path.join(__dirname, '../../public/templates.js'), data);
                            promiseFunctions.readAndWrite(path.join(__dirname, '../../node_modules/handlebars/dist/handlebars.runtime.js'), path.join(__dirname, '../../public/hb.js'));
                        });
                    });
                });
            });
        }).done(function () {
            console.log(THUMS_data.theme.scripts);
            minifyThumsClient(THUMS_data.theme.scripts);
            callback(THUMS_data);
        });
};