module.exports = (function () {
    'use strict';
    var login_section = [{
            id: 1,
            title: 'Login',
            type: 'login',
            action: 'read',
            content: {
                register: false,
                login: true
            }
        }],
        register_section = [{
            id: 1,
            title: 'Register',
            type: 'login',
            action: 'read',
            content: {
                register: true,
                login: false
            }
        }],
        db = null,
        routes = [
            {
                path: '/admin/{page?}',
                id: 'THUMS-Admin',
                handler: function (request, reply) {
                    var new_post;
                    if (!request.auth.isAuthenticated) {
                        reply(login_section);
                    }
                    if (db) {
                        db.getPostsByCategory('blog')
                            .then(function (posts) {
                                reply(posts.map(function (post) {
                                    new_post = post.modules[0];
                                    new_post.id = post.id;
                                    new_post.action = 'link';
                                    new_post.slug = '/admin/edit/' + post.slug;
                                    return new_post;
                                }));
                            })
                    } else {
                        reply(null);
                    }
                }
            }, {
                path: '/admin/edit/{page?}',
                id: 'THUMS-Admin',
                handler: function (request, reply) {
                    if (!request.auth.isAuthenticated) {
                        reply(login_section);
                    }
                    if (request.method === 'get') {
                        if (db) {
                            db.loadPost(request.params.page || null)
                                .then(function (post) {
                                    post.modules = post.modules.map(function (module) {
                                        module.action = 'edit';
                                        return module;
                                    });
                                    reply(post.modules);
                                });
                        } else {
                            reply([]);
                        }
                    }
                    if (request.method === 'post') {
                        if (request.payload.modules) {
                            request.payload.modules.forEach(function (module) {
                                var new_module = {};
                                new_module.id = module.id;
                                new_module.type = module.type;
                                new_module.title = module.title;
                                new_module.classname = module.classname;
                                new_module.content = module.content;
                                db.addModule(new_module);
                            })
                        }
                        reply([]);
                    }
                }
            }, {
                path: '/admin/login',
                id: 'THUMS-Admin-login',
                handler: function (request, reply) {
                    if (request.auth.isAuthenticated) {
                        return reply([]);
                    }
                    if (request.method === 'get') {
                        db.count('users', 'id')
                            .then(function (num) {
                                if (num) {
                                    return reply(login_section);
                                } else {
                                    console.log('no user!');
                                    return reply(register_section);
                                }
                            });
                    }
                    if (request.method === 'post') {
                        if (request.payload.email) {

                            // New user registration.
                            db.count('users', 'id') // Make sure there are no users.
                                .then(function (num) {
                                    if (!num) {
                                        db.addUser(request.payload.email,
                                            request.payload.username,
                                            request.payload.password)
                                            .then(function () {
                                                reply(login_section);
                                            })
                                    } else {
                                        return reply(login_section);
                                    }
                                });
                        } else {
                            db.authenticateUser(request.payload.username, request.payload.password)
                                .then(function (match_object) {
                                    request.auth.session.set(match_object);
                                    return reply([]);
                                }).catch(function () {
                                    return reply([]);
                                });
                        }
                    }
                }
            }
        ];

    function database(data) {
        'use strict';
        db = data;
    }
    return {
        routes: routes,
        database: database
    };
})();
