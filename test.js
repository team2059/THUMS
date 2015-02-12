var server = require('./lib');

server.init(function(){
    process.exit();
});

module.exports = server;