/* global describe: true */
/* global it: true */
require('assert');
require('./io'); // Test io modules.

var server = require('../lib/');

// Not using a ES6 pointer to play nicely with Mocha.
describe('Start', function () {
    'use strict';
    this.timeout(150000);
    it('should start without error.', (done) => {
        server.start(() => {
            done();
        });
    });
});

