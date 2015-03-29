/**
 * Install applications so that they can be used later.
 */
var npm = require('npm');

/**
 * Use npm to install all packages in a list.
 * @param {object[]} packages
 * @returns {Promise}
 */
function install(packages) {
    'use strict';
    return new Promise(
        (resolve, reject) => {
            npm.load((err, npm) => {
                if (err) {
                    reject(err);
                } else {
                    npm.commands.install(packages, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        }
    );
}

/**
 * Install all applications listed in the contest/apps directory.
 * @param {object[]} app_names
 * @returns {Promise}
 */
function installApp(app_names) {
    'use strict';
    return new Promise(
        (resolve, reject) => {
            let thums_apps = app_names.map((i) => {
                // Let npm know where the app is located.
                return 'file:./content/apps/' + i;
            });
            install(thums_apps)
                .then(() => {
                    resolve(app_names);
                })
                .catch((e) => {
                    reject(e);
                });
        });
}

module.exports = installApp;
