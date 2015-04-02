/**
 * Package React + components as templates.js
 */
var fs = require('fs'),
    browserify = require('browserify');

module.exports = () => {
    'use strict';
    return new Promise(
        (resolve) => {
            browserify({debug: true})
                .add('./lib/rendering/compile.js')
                .plugin('minifyify', {map: false})
                .bundle()
                .pipe(fs.createWriteStream('static/templates.js'));
            console.log('Template prepared.');
            resolve();
        });
};
