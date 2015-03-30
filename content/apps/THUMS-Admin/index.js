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
                    if (!request.auth.isAuthenticated) {
                        reply(login_section);
                    }
                    if (db) {
                        db.getPostsByCategory('blog')
                            .then(function (posts) {
                                reply(posts.map(function (post) {
                                    return {id: post.id,
                                        type: 'text',
                                        action: 'link',
                                        title: post.title,
                                        slug: '/admin/edit/' + post.slug,
                                        classname: 'module'
                                    };
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
