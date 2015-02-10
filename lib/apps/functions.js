var path = require("path"),
    Promise = require("bluebird"),
    fs = Promise.promisifyAll(require("fs")),
    watch = require("watch"),
    npm = require("npm");

function install(arr) {
    npm.commands.install(arr, function (err) {
        if (err) {
            console.log(err)
        }
    });
}

function getDir(dirName) {
    return fs.readdirAsync(dirName).map(function(fileName) {
        return fileName;
    }).reduce(function (a, b) {
        return a.concat(b);
    }, []);
}

function getPackages(file) {
    return fs.readFileAsync(file).then(JSON.parse).then(function (pack) {
        if (pack.dependencies) {
            var packages = Object.keys(pack.dependencies),
                versions = pack.dependencies,
                to_install,
                install_queue = [];
            for (var i = 0; i < packages.length; i++) {
                to_install = packages[i] + "@" + versions[packages[i]];
                install_queue.push(to_install)
            }
            return install_queue;
            //install(install_queue);
        }
    }).reduce(function (a, b) {
        return a.concat(b);
    }, []).catch(SyntaxError, function (e) {
        console.error("Invalid package on ", file);
    }).catch(function (e) {
        console.error("Unable to read ", file);
    })
}

function loadApp(filePath) {
    getPackages(filePath).then(function(pckgs) {
        console.log("PATH: ",filePath);
        console.log("PACKAGES: ",pckgs);
        return npm.commands.install(path.join(filePath,"../"),pckgs);
    }).done(function(err) {
        console.log("DONE");
    });
}

module.exports = {
    install: install,
    getDir: getDir,
    getPackages: getPackages,
    loadApp: loadApp
}
