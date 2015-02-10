var path = require("path"),
    appFunctions = require("./functions.js"),
    load,
    apps = {};

load = function (callback) {
    appFunctions.getDir(path.join(__dirname, "../../content/apps")).each(function (file) {
        var pk = require(file);
        apps[pk.name] = pk;
    }).then(function (file) {
        callback(apps);
    });
};

load(function(){});

module.exports = {
    load: load
};

