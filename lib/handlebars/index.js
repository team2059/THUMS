"use strict";
var handlebars = require('handlebars'),
    path = require('path'),
    loadPartials,
    loadModules,
    loadPages,
    engine,
    templates = {};

loadPartials = function (partials) {
    var x;
    for (x in partials) {
        if (partials.hasOwnProperty(x)) {
            handlebars.registerPartial(x, partials[x]);
        }
    }
};

loadModules = function (modules, callback) {
    handlebars.registerPartial('modules', modules);
    var precompiled_modules = '(function() {var template = Handlebars.template, templates = Handlebars.partials = Handlebars.partials || {};templates["modules"]=template(' + handlebars.precompile(modules) + ');})();';
    callback(null, precompiled_modules);
};

loadPages = function (pages) {
    var x;
    for (x in pages) {
        if (pages.hasOwnProperty(x)) {
            templates[x] = handlebars.compile(pages[x]);
        }
    }
};

engine = function (filePath, options, callback) {
    if (templates[path.basename(filePath, '.hbs')]) {
        return callback(null, templates[path.basename(filePath, '.hbs')](options));
    }
    console.log(path.basename(filePath, '.hbs'));
    console.log(templates);
    return (new Error(":("));
};

module.exports = {
    loadPartials: loadPartials,
    loadModules: loadModules,
    loadPages: loadPages,
    engine: engine
}