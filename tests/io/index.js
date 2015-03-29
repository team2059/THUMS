/* global describe: true */
/* global it: true */
require('assert');

var io = require('../../lib/io');

describe('Read file', () => {
    'use strict';
    it('respond with matching string.', () => {
        io.readFile('default.config.json')
            .then((file_contents) => {
                file_contents.should.equal(`{
                "database": {
                    "client": "sqlite3",
                        "connection": {
                        "filename": "./database.db"
                    }
                }
            }`);
            });
    });
});

describe('Read file as JSON', () => {
    'use strict';
    it('respond with matching JSON array.', () => {
        io.readFileAsJson('default.config.json')
            .then((file_contents) => {
                file_contents.should.equal({
                    database: {
                        client: 'sqlite3',
                        connection: {
                            filename: './database.db'
                        }
                    }
                });
            });
    });
});
