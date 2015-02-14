"use strict";
var path = require('path'),
    processData = require('../process'),
    promise = require('bluebird'),
    fs = promise.promisifyAll(require("fs")),
    ensureExists,
    getDir,
    getFilesInDirectory,
    readAndWrite,
    readFile,
    readAssetsFolder,
    readHandlebarsFolder,
    readJSON,
    writeFile;

ensureExists = function (path) {
    return fs.mkdirAsync(path, 511).catch(function(e) {
        return;
    });
};

getDir = function (dirName) {
    return fs.readdirAsync(dirName).map(function (fileName) {
        var new_path = path.join(dirName, fileName);
        return fs.statAsync(new_path).then(function (stats) {
            return stats.isDirectory() ? new_path : null;
        });
    }).reduce(function (a, b) {
        return a.concat(b);
    }, []).filter(function (a) {
        if (a) {
            return a;
        }
    });
};

getFilesInDirectory = function (path_name) {
    return fs.readdirAsync(path_name);
};

readAndWrite = function(reader, writer) {
    return fs.createReadStream(reader).pipe(
        fs.createWriteStream(writer)
    );
};

readAssetsFolder = function (path_name) {
    var assets = [];
    return getFilesInDirectory(path_name).each(function (file) {
        assets.push(path.join(path_name, file));
    });
    return assets;
};

readHandlebarsFolder = function (path_name) {
    var partials = {};
    return getFilesInDirectory(path_name).each(function (partial) {
        if (path.extname(partial) === '.hbs') {
            var base = path.basename(partial, '.hbs');
            return fs.readFileAsync(path.join(path_name, partial), 'utf8').then(function (data) {
                partials[base] = processData.minifyHtml(data);
            });
        }
    }).then(function () {
        return partials;
    });
};

readFile = function (file) {
    return fs.readFileAsync(file, 'utf8').catch(function (e) {
        console.error("Unable to read ", file);
    });
};

readJSON = function (file) {
    return readFile(file).then(JSON.parse).then(function (options) {
        return options;
    }).catch(SyntaxError, function (e) {
        console.error("Invalid config file ", file);
    }).catch(function (e) {
        console.error("Unable to read ", file);
    });
};

writeFile = function (file, string) {
    return fs.writeFileAsync(file, string, 'utf8');
};

module.exports = {
    ensureExists: ensureExists,
    getDir: getDir,
    getFilesInDirectory: getFilesInDirectory,
    readAndWrite: readAndWrite,
    readAssetsFolder: readAssetsFolder,
    readFile: readFile,
    readHandlebarsFolder: readHandlebarsFolder,
    readJSON: readJSON,
    writeFile: writeFile
}