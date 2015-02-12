// Not currently used.
// TODO: Figure out how to run this in the background.
var watch = require("watch"),
    path = require("path"),
    appFunctions = require("./functions.js");

watch.createMonitor(path.join(__dirname,"../../content/apps"), function(monitor) {
    monitor.on("created", function(f, stat) {
        if (stat.isDirectory()) {
            appFunctions.loadApp(path.join(f,"package.json"));
        }
    });
});