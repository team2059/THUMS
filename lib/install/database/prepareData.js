/**
 * Helper functions for working with the database.
 * @param thums
 * @returns {{getPostBySlug: Function,
 *     getPostsByCategory: Function,
 *     getListOfModulesByPostId: Function,
 *     getModuleByIds: Function,
 *     loadPost: Function}}
 */
module.exports = (thums) => {
    'use strict';
    var bookshelf = thums.bookshelf,
        Module = bookshelf.Model.extend({
            tableName: 'modules',
            defaults: {
                type: 'text',
                classname: 'module',
                content: JSON.stringify({content: ''})
            }
        }),
        PostModules = bookshelf.Model.extend({
            tableName: 'postmodules'
        }),
        Post = bookshelf.Model.extend({
            tableName: 'posts',
            hasTimestamps: ['created_at', 'updated_at']
        }),
        Categories = bookshelf.Model.extend({
            tableName: 'categories'
        });

    // TODO: Fix timing on first load.
    Post.collection().fetch().then((collection) => {
        if (collection.length < 1) {
            setTimeout(() => { // Give the database some time to load.
                new Post({title: 'TEST!'})
                    .save();
                new Module({title: 'TEST!',
                    content: JSON.stringify({content: 'This is a test post.'})})
                    .save();
                new PostModules({post: 1, module: 1, order: 1})
                    .save();
                new Categories({category: 'blog', post: 1})
                    .save();
            }, 2500);
        }
    });
    /**
     * Find a post using its slug (URI).
     * @param {string} slug
     * @returns {Promise}
     */
    let getPostBySlug = (slug) => {
        return new Promise((resolve, reject) => {
            new Post({slug: slug})
                .fetch()
                .then((post) => {
                    if (post) {
                        resolve(post.toJSON());
                    } else {
                        reject('No post found');
                    }
                });
        });
    },
        /**
         * Get a list of posts from an array of ids.
         * @param {object[]} posts
         * @returns {Promise}
         */
        getPostsByIds = (posts) => {
            return new Promise((resolve) => {
                new Post()
                    .query((qb) => {
                        qb.whereIn('id', posts);
                    })
                    .fetchAll()
                    .then((posts) => {
                        resolve(posts.toJSON());
                    });
            });
        },
        /**
         * Find all modules that belong to a post.
         * @param {string} post_id
         * @returns {Promise}
         */
        getListOfModulesByPostId = (post_id) => {
            return new Promise((resolve, reject) => {
                new PostModules({post: post_id})
                    .fetch()
                    .then((query_results) => {
                        if (!query_results) {
                            reject('No modules found.');
                        }
                        return query_results.query().then((module_list) => {
                            let list_of_modules = [];
                            module_list.forEach(i => {
                                list_of_modules.push(i.module);
                            });
                            resolve(list_of_modules);
                        });
                    });
            });
        },
        /**
         * Get an array of modules from an array of module ids.
         * @param {object[]} modules
         * @returns {Promise}
         */
        getModuleByIds = (modules) => {
            return new Promise((resolve) => {
                new Module()
                    .query((qb) => {
                        qb.whereIn('id', modules);
                    })
                    .fetchAll()
                    .then((module) => {
                        resolve(module.toJSON());
                    });
            });
        },
        /**
         * Load a post and its modules.
         * @param {string} post_slug
         * @returns {Promise}
         */
        loadPost = (post_slug) => {
            let response = {};
            return new Promise((resolve, reject) => {
                getPostBySlug(post_slug)
                    .then((post_data) => {
                        response = post_data;
                        return response.id;
                    }).then((post_id) => {
                        response.modules = [];
                        return getListOfModulesByPostId(post_id);
                    }).then(getModuleByIds)
                    .then((modules) => {
                        response.modules = modules;
                        resolve(response);
                    })
                    .catch((e) => {
                        reject(e);
                    });
            });
        },
        /**
         * Get a list of posts in a category.
         * @param {string} category_name
         * @returns {Promise}
         */
        getPostsByCategory = (category_name) => {
            return new Promise(
                (resolve, reject) => {
                    new Categories({category: category_name})
                        .fetchAll()
                        .then((query_results) => {
                            let results = query_results.toJSON();
                            if (!results) {
                                reject('No posts found.');
                            } else {
                                return results.map(result => {
                                    return result.post;
                                });
                            }
                        })
                        .then(getPostsByIds)
                        .then((posts) => {
                            resolve(posts);
                        })
                        .catch((e) => {
                            reject(e);
                        });
                }
            );
        };
    return {
        getPostBySlug: getPostBySlug,
        getPostsByCategory: getPostsByCategory,
        getListOfModulesByPostId: getListOfModulesByPostId,
        getModuleByIds: getModuleByIds,
        loadPost: loadPost
    };
};
