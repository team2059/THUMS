"use strict";
var server = require('./lib');

server.init();

// In theory, this should allow THUMS to be used in other applications.
module.exports = server;