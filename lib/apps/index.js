var path = require("path"),
    appFunctions = require("./functions.js"),
    load,
    add_module,
    get_modules,
    app_modules = {};
    
load = function (callback) {
    var apps = {};
    appFunctions.getDir(path.join(__dirname, "../../content/apps")).each(function (file) {
        var pk = require(file);
        apps[pk.name] = pk;
    }).then(function (file) {
        callback(apps);
    });
};

add_module = function(reserve,func) {
    if (!app_modules[reserve]) {
        app_modules[reserve] = [];
    }
    app_modules[reserve].push(func);
}

get_modules = function(reserve) {
    return app_modules[reserve];
}


load(function(){});

module.exports = {
    load: load,
    add_module: add_module,
    get_modules: get_modules
};

