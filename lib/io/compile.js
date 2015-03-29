/**
 * Render functions for any preprocessed files.
 * @module lib/io/compile
 */
var lessJs = require('less');

/**
 * Render LESS to CSS.
 * @param {string} string
 * @returns {Promise}
 */
function less(string) {
    'use strict';
    return new Promise(
        (resolve, reject) => {
            lessJs.render(string.toString(), {
                compress: true
            }, (err, output) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(output.css);
                }
            });
        }
    );
}

module.exports = {
    less: less
};
