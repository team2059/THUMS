var bcrypt = require('bcryptjs'),
    bookshelf, Module, PostModules, Post, Categories, User;
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
    bookshelf = thums.bookshelf;
    Module = bookshelf.Model.extend({
        tableName: 'modules',
        defaults: {
            type: 'text',
            classname: 'module',
            content: JSON.stringify({content: ''})
        }
    });
    PostModules = bookshelf.Model.extend({
        tableName: 'postmodules'
    });
    Post = bookshelf.Model.extend({
        tableName: 'posts',
        hasTimestamps: ['created_at', 'updated_at']
    });
    Categories = bookshelf.Model.extend({
        tableName: 'categories'
    });
    User = bookshelf.Model.extend({
        tableName: 'users'
    });

    Post.collection().fetch().then((collection) => {
        if (collection.length < 1) {
            new Post({
                title: 'TEST!'
            })
                .save();
            new Module({title: 'TEST!',
                content: JSON.stringify({self: 'This is a test post.'})
            })
                .save();
            new PostModules({
                post: 1,
                module: 1,
                order: 1
            })
                .save();
            new Categories({
                category: 'blog',
                post: 1
            })
                .save();
        }
    });
    let count = (table, column) => {
        return new Promise(
            (resolve, reject) => {
                bookshelf.knex(table).count(column)
                    .then((num) => {
                        if (!num) {
                            reject();
                        }
                        resolve(num[0][Object.keys(num[0])]);
                    })
                    .catch((e) => {
                        reject(e);
                    });
            }
        );
    },
        /**
         * Find a post using its slug (URI).
         * @param {string} slug
         * @returns {Promise}
         */
        getPostBySlug = (slug) => {
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
                        resolve(module.toJSON().map(function (mod) {
                            mod.action = 'read';
                            return mod;
                        }));
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
                            resolve(posts.map(post => {
                                if (post.slug === null) {
                                    post.slug = '';
                                }
                                return post;
                            }));
                        })
                        .catch((e) => {
                            reject(e);
                        });
                }
            );
        },
        /**
         * Check if a user's credentials are correct.
         * @param {string} username
         * @param {string} password
         * @returns {Promise}
         */
        authenticateUser = (username, password) => {
            return new Promise(
                (resolve, reject) => {
                    new User({
                        username: username
                    }).fetch()
                        .then((results) => {
                            if (!results) {
                                return reject('User not found.');
                            }
                            let user_info = results.toJSON();
                            bcrypt.compare(password,
                                user_info.password,
                                function (err, res) {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        if (res) {
                                            resolve({
                                                id: user_info.id,
                                                username: user_info.username
                                            });
                                        }
                                        reject('Invalid password.');
                                    }
                                });
                        });
                }
            );
        },
        /**
         * Register a new user.
         * @param {string} email
         * @param {string} username
         * @param {string} password - Hashed later.
         * @returns {Promise}
         */
        addUser = (email, username, password) => {
            return new Promise(
                (resolve, reject) => {
                    bcrypt.hash(password, 8, function (err, hash) {
                        if (err) {
                            reject(err);
                        } else {
                            new User({
                                email: email,
                                username: username,
                                password: hash
                            }).save()
                                .then((user) => {
                                    console.log(user);
                                    resolve();
                                });
                        }
                    });
                }
            );
        };
    return {
        count: count,
        getPostBySlug: getPostBySlug,
        getPostsByCategory: getPostsByCategory,
        getListOfModulesByPostId: getListOfModulesByPostId,
        getModuleByIds: getModuleByIds,
        loadPost: loadPost,
        authenticateUser: authenticateUser,
        addUser: addUser
    };
};
