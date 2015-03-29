/**
 * Save the theme's LESS file as minified CSS.
 */
var io = require('../../io'),
    compiler = require('../../io/compile.js');

module.exports = (file_data) => {
    'use strict';
    console.log('Compiling CSS.');
    compiler.less(file_data)
        .then((new_css) => {
            io.writeFile('./static/style.css', new_css);
            console.log('CSS compiled.');
        });
};
