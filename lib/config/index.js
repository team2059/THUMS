var data = require('../data'),
    fs = require('fs'),
    ncp = require('ncp').ncp;
    path = require('path');

module.exports = function() {
    fs.readFile( path.join(__dirname,'config.json') , function(err,instructions){
        if (!err) {
            instructions = JSON.parse(instructions);
            console.log("Creating database");
            for (var x = 0; x < instructions.database.tables.length; x++) {
                data.createTable(instructions.database.tables[x], function(err,row) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        } else {
            console.log(err);
        }
    });
    ncp(path.join(__dirname,'../../content/themes/print'), path.join(__dirname,"../../views"), function(err) {
        if (err) {
            return console.error(err);
        } 
    });
}