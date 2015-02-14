"use strict";
var promise = require('bluebird'),
    promiseFunctions = require("../promises"),
    handlebars = require('../handlebars'),
    npm = promise.promisifyAll(require('npm')),
    path = require('path'),
    processFiles = promise.promisifyAll(require('../process')),
    //apps = require('../apps'),
    data = promise.promisifyAll(require('../data')),
    npm_installed = false,
    begin,
    THUMS_data,
    theme_path;

begin = promise.promisify(function (callback) {
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
        var requested_tables = options.database.tables,
            nonexistent_tables = [],
            x;
        for (x in requested_tables) {
            if (requested_tables.hasOwnProperty(x)) {
                if (tables.indexOf(requested_tables[x].name) < 0) {
                    nonexistent_tables.push(requested_tables[x]);
                }
            }
        }
        return nonexistent_tables;
    });
}

function getNonexistentTablesFromConfigFile(filePath) {
    return promiseFunctions.readJSON(filePath).then(getNonexistentTables);
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

function loadApps() {
    return promiseFunctions.getDir(path.join(__dirname, "../../content/apps")).map(function (file) {
        return promiseFunctions.readJSON(path.join(file, 'package.json')).then(function (pack) {
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
    console.log("Installing dependencies...");
    function wait() {
        if (npm_installed) {
            callback(null, true);
        } else {
            setTimeout(wait, 1000);
        }
    }
    wait();
}

module.exports = function (callback) {
    THUMS_data = {};
    begin().then(function () {
        // Check that the database has all of the tables it needs.
        return getNonexistentTablesFromConfigFile(path.join(__dirname, 'config.json')).then(function (options) {
            if (options.length > 0) {
                var x,
                    onCreated = function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Created table", options[x].name);
                        }
                    };
                for (x in options) {
                    if (options.hasOwnProperty(x)) {
                        data.createTable(options[x], onCreated);
                    }
                }
            }
            return;
        }).then(function () {
            var theme_name = "print";
            theme_path = path.join(__dirname, "../../content/themes", theme_name);
            return getTheme(theme_path).then(function (x) {
                THUMS_data.theme = x;
                THUMS_data.theme.name = theme_name;
                return compileThemeStylesheet(theme_path, THUMS_data.theme.assets);
            }).then(function () {
                return loadApps().then(function () {
                    installFinished = promise.promisify(installFinished);
                    return installFinished().then(function () {
                        processAssets(path.join(theme_path, 'assets'), THUMS_data.theme.assets, function (err, scripts) {
                            THUMS_data.theme.scripts = scripts;
                            handlebars.loadModules(THUMS_data.theme.partials.modules, function (err, data) {
                                promiseFunctions.writeFile(path.join(__dirname, '../../public/templates.js'), data);
                                promiseFunctions.readAndWrite(path.join(__dirname, '../../node_modules/handlebars/dist/handlebars.runtime.js'), path.join(__dirname, '../../public/hb.js'));
                            });
                        });
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