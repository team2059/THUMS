/**
 * Set up routing.
 * @param {object} thums
 */

module.exports = (thums) => {
    'use strict';
    let route_list = {}; // Holds the application routes.
    /**
     * Reused function used to load a post from the database.
     * @param {object} request
     * @returns {Promise}
     */
    function returnApi(request) {
        return new Promise(
            (resolve, reject) => {
                thums.database.loadPost(request.params.name || null)
                    .then((post) => {
                        resolve(post);
                    })
                    .catch((e) => {
                        reject(e);
                    });
            }
        );
    }

    // Prepare for later use.
    thums.apps.forEach(app => {
        if (app.routes) {
            app.routes.forEach(route => {
                if (!route_list[route.path]) {
                    route_list[route.path] = [];
                }
                route_list[route.path].push({
                    id: route.id,
                    handler: route.handler
                });
            });
        }
    });

    // Add routes to the server.
    Object.keys(route_list).forEach(path => {

        // API route (no rendering).
        thums.server.route({
            method: 'GET',
            path: '/api' + path,
            config: {
                pre: route_list[path].map(handle => {
                    return {
                        method: handle.handler,
                        assign: handle.id
                    };
                })
            },
            handler: (request, reply) => {
                let parsed_uri = request.path.replace('/api', '').split('/');
                returnApi(parsed_uri[1])
                    .then((post) => {
                        Object.keys(request.pre).forEach(i => {
                            post.modules = post.modules.concat(request.pre[i]);
                        });
                        reply(post);
                    })
                    .catch((e) => {
                        let post = {modules: []};
                        Object.keys(request.pre).forEach(i => {
                            post.modules = post.modules.concat(request.pre[i]);
                        });
                        reply((post.modules) ?
                            post :
                            e).code((post.modules) ? 200 : 404);
                    });
            }
        });

        // Server-side rendering.
        thums.server.route({
            method: 'GET',
            path: path,
            config: {
                pre: route_list[path].map(handle => {
                    return {
                        method: handle.handler,
                        assign: handle.id
                    };
                })
            },
            handler: (request, reply) => {
                let parsed_uri = request.path.replace('/api', '').split('/');
                returnApi(parsed_uri[1])
                    .then((post) => {
                        Object.keys(request.pre).forEach(i => {
                            post.modules = post.modules.concat(request.pre[i]);
                        });
                        post.initial = JSON.stringify(post);
                        post.content = thums.renderer.render(post);
                        reply.view('index', post);
                    })
                    .catch((e) => {
                        let post = {modules: []};
                        Object.keys(request.pre).forEach(i => {
                            post.modules = post.modules.concat(request.pre[i]);
                        });
                        post.initial = JSON.stringify(post);
                        post.content = thums.renderer.render(post);
                        reply.view('index', (post.modules) ?
                            post :
                            e).code((post.modules) ? 200 : 404);
                    });
            }
        });
    });

    // Fallback API call used by pages and posts.
    thums.server.route({
        method: 'GET',
        path: '/api/{name?}',
        handler: (request, reply) => {
            returnApi(request)
                .then((post) => {
                    reply(post);
                })
                .catch((e) => {
                    reply(e).code(404);
                });
        }
    });

    // Fallback page rendering used by pages and posts.
    thums.server.route({
        method: 'GET',
        path: '/{name?}',
        handler: (request, reply) => {
            returnApi(request)
                .then((post) => {
                    post.initial = JSON.stringify(post);
                    post.content = thums.renderer.render(post);
                    reply.view('index', post);
                })
                .catch((e) => {
                    reply.view('index', e).code(404);
                });
        }
    });

    // Serve static files.
    thums.server.route({
        method: 'GET',
        path: '/static/{param*}',
        handler: {
            directory: {
                path: '../static'
            }
        }
    });
};
