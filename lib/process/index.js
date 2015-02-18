"use strict";
var htmlMinify = require('html-minifier').minify,
    UglifyJS = require("uglify-js"),
    less = require("less"),
    compileLess,
    minifyJavaScript,
    minifyHtml;

minifyHtml = function (string) {
    return htmlMinify(string, {
        collapseWhitespace: true,
        removeOptionalTags: true
    });
};

minifyJavaScript = function (array) {
    return UglifyJS.minify(array, {
        "quote_style": 1
    }).code;
};

compileLess = function (string, callback) {
    less.render(string, {
        compress: true
    }, function (err, output) {
        callback(null, output.css);
    });
};

module.exports = {
    compileLess: compileLess,
    minifyHtml: minifyHtml,
    minifyJavaScript: minifyJavaScript
};