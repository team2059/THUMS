/**
 * Schema information used by knex to construct the database.
 * @type {{posts: Function,
 *     modules: Function,
 *     postmodules: Function,
 *     categories: Function,
 *     users: Function,
 *     sessions: Function}}
 */
module.exports = {
    posts: (table) => {
        'use strict';
        table.increments('id').primary();
        table.string('slug');
        table.string('parent');
        table.string('title');
        table.integer('featured');
        table.timestamps();
    },
    modules: (table) => {
        'use strict';
        table.increments('id').primary();
        table.string('type');
        table.string('classname');
        table.string('title');
        table.string('content');
    },
    postmodules: (table) => {
        'use strict';
        table.increments('id').primary();
        table.integer('post');
        table.integer('module');
        table.integer('order');
    },
    categories: (table) => {
        'use strict';
        table.increments('id').primary();
        table.string('category');
        table.integer('post');
    },
    users: (table) => {
        'use strict';
        table.increments('id').primary();
        table.string('email');
        table.string('username');
        table.string('password');
    },
    sessions: (table) => {
        'use strict';
        table.integer('id').primary();
        table.uuid('session');
        table.string('ip');
    }
};
