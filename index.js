require('babel/register'); // Compile to ES5.

var server = require('./lib'); // Main library.

server.start();

// In theory, this should allow THUMS
// to be used in other applications.
module.exports = server;
