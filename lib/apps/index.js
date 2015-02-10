var path = require("path"),
    appFunctions = require("./functions.js"),
    npm = require("npm"),
    apps = {};

npm.load(function () {
    appFunctions.getDir(path.join(__dirname, "../../content/apps")).each(function(file) {
        appFunctions.loadApp(path.join(__dirname, "../../content/apps", file, "package.json"));
    }).done();
});

module.exports = apps;