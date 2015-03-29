let start_thums = require('./install'),
    route = require('./install/route.js'); // Create server routes.

module.exports = (() => {
    'use strict';
    function start(callback) {
        if (!callback) {
            callback = () => {
                // If no callback is provided.
                console.log('THUMS has started');
            };
        }
        start_thums()
            .then((thums) => {
                thums.renderer = require('./rendering');
                thums.apps.forEach(app => {
                    if (typeof app.database === 'function') {
                        app.database(thums.database);
                    }
                });
                route(thums);
                console.log('Routed.');

                // Only start the server when everything has finished loading.
                thums.server.start();
                callback();
            });
    }
    return {
        start: start
    };
})();
