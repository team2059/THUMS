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
                                    type: 'postlink',
                                    title: post.title,
                                    slug: post.slug
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
