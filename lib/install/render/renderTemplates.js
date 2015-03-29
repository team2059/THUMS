/**
 * Package React + components as templates.js
 */
var fs = require('fs'),
    browserify = require('browserify'),
    reactify = require('reactify');

module.exports = () => {
    'use strict';
    return new Promise(
        (resolve) => {
            browserify({debug: true})
                .transform(reactify)
                .add('./lib/rendering/compile.js')
                .plugin('minifyify', {map: false})
                .bundle()
                .pipe(fs.createWriteStream('static/templates.js'));
            console.log('Template prepared.');
            resolve();
        });
};
