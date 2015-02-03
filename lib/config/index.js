var data = require('../data'),
    fs = require('fs'),
    ncp = require('ncp').ncp,
    less = require("less"),
    path = require('path'),
    LessData = null;

function compileLESS() {
    less.render(LessData, {
        paths: [path.join(__dirname,'../../views')], 
        compress: true
    }, function(e, output) {
        if (e) {
            console.log(e);
        } else {
            console.log(output.css);
            console.log(path.join(__dirname,'../../public/style.css'));
            fs.writeFile(path.join(__dirname,'../../public/style.css'), output.css);
        }
    });
}

function waitForStyle() {
    if (fs.existsSync(path.join(__dirname,'../../views/style.less'))) {
        compileLESS();
    } else {
        setTimeout(waitForStyle,1000);
    }
}

function start() {
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
    ncp(path.join(__dirname,'../admin/templates'), path.join(__dirname,"../../views"), function(err) {
        if (err) {
            return console.error(err);
        }
        ncp(path.join(__dirname,'../../content/themes/print'), path.join(__dirname,"../../views"), function(err) {
            if (err) {
                return console.error(err);
            }
            fs.readFile(path.join(__dirname,'../../views/thums-style.less'), "utf8", function (err, data) {
                if (err) throw err;
                LessData = data;
                waitForStyle();
            });
        });
    });
}

module.exports = start;