module.exports = (function () {
    'use strict';
    var db = null,
        routes = [{
            method: 'GET',
            path: '/blog/{page?}',
            id: 'THUMS-Blog',
            handler: function (request, reply) {
                if (db) {
                    db.getPostsByCategory('blog')
                        .then(function (posts) {
                            reply(posts.map(function (post) {
                                return {id: post.id,
                                    type: 'text',
                                    title: post.title,
                                    slug: post.slug,
                                    classname: 'module'
                                };
                            }));
                        })
                } else {
                    reply(null);
                }
            }
        }];

    function database(data) {
        'use strict';
        db = data;
    }
    return {
        routes: routes,
        database: database
    };
})();
