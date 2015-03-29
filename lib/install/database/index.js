/**
 * Prepare the database.
 * @module lib/install/database
 */
let Bookshelf = require('bookshelf'),
    schema = require('./schema.js'),
    prepareDatabase = require('./prepareData.js');

module.exports = (thums) => {
    'use strict';
    return new Promise(
        (resolve) => {
            let knex = require('knex')(thums.settings.database);
            Object.keys(schema).forEach(table_name => {
                knex.schema.hasTable(table_name)
                    .then((exists) => {
                        if (!exists) {
                            return knex.schema
                                .createTable(table_name,
                                (table) => schema[table_name](table));
                        }
                    });
            });
            console.log('Created database.');
            thums.bookshelf = new Bookshelf(knex);
            thums.database = prepareDatabase(thums);
            resolve(thums);
        }
    );
};