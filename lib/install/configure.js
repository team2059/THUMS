/**
 * Read user configuration settings and use them to prepare the server.
 */
var io = require('../io'),
    Path = require('path'),
    Hapi = require('hapi'),
    install_packages = require('./packages'),
    thums = {};

module.exports = (file) => {
    'use strict';
    return new Promise(
        (resolve) => {
            io.readFileAsJson(file)
                .then((config) => {
                    console.log('Loaded settings.');

                    // Save the settings for later use.
                    thums.settings = config;
                    thums.server = new Hapi.Server({
                        connections: {
                            routes: {
                                files: {
                                    relativeTo: Path.join(
                                        __dirname,
                                        '../..',
                                        'static'
                                    )
                                }
                            }
                        }
                    });

                    // Load the port from config.json or use 3000 by default.
                    thums.server.connection({
                        port: config.port || 3000
                    });

                    // Use the theme's pages directory to render views.
                    thums.server.views({
                        engines: {
                            hbs: require('handlebars')
                        },
                        path: 'content/themes/' +
                        config.theme + '/pages'
                    });
                    io.copyDirectory('content/themes/' +
                        config.theme +
                        '/assets', 'static')
                        .then(() => {
                            console.log('Copied theme assets.');
                        });
                    return Object.keys(config.apps).filter((i) => {
                        return config.apps[i] === 'file';
                    }).map((i) => {
                        return (i);
                    });
                }).then(install_packages)
                .then((packages) => {
                    thums.apps = packages.map(pack => {
                        // Now that the applications are installed, import them.
                        return require(pack);
                    });
                }).then(() => {
                    resolve(thums);
                });
        }
    );
};
