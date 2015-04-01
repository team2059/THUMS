module.exports = (function () {
    'use strict';
    var db = null,
        routes = [{
            method: 'GET',
            path: '/blog/{page?}',
            id: 'THUMS-Blog',
            handler: function (request, reply) {
                var new_post;
                if (db) {
                    db.getPostsByCategory('blog')
                        .then(function (posts) {
                            console.log(posts);
                            reply(posts.map(function (post) {
                                new_post = post.modules[0];
                                new_post.id = post.id;
                                new_post.action = 'link';
                                new_post.slug = post.slug;
                                return new_post;
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
