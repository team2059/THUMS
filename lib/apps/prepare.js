var path = require("path"),
    appFunctions = require("./functions.js"),
    npm = require("npm");

npm.load(function () {
    appFunctions.getDir(path.join(__dirname, "../../content/apps")).each(function(file) {
        appFunctions.loadApp(path.join(file, "package.json"));
    }).done();
});