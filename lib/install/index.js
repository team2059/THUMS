/**
 *
 */
let runDatabase = require('./database'),
    io = require('../io'),
    configure = require('./configure.js'),
    renderCss = require('./render/renderCss.js'),
    renderTemplates = require('./render/renderTemplates.js'),
    thums;

module.exports = () => {
    'use strict';
    return new Promise(
        (resolve) => {
            // TODO: Check if a config.json is provided.
            // If not, use default.config.json instead.
            configure('config.json')
                .then(runDatabase)
                .then((new_thums) => {
                    thums = new_thums;
                    return 'content/themes/' +
                        thums.settings.theme +
                        '/assets/style.less';
                }).then(io.readFile)
                .then(renderCss)
                .then(renderTemplates)
                .then(() => {
                    resolve(thums);
                })
                .catch((e) => {
                    console.error(e);
                });
        });
};

