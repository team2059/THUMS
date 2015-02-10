var data = require('../data'),
    appsPrepare = require("../apps/prepare.js"),
    fs = require('fs'),
    ncp = require('ncp').ncp,
    less = require("less"),
    path = require('path'),
    Handlebars = require("handlebars"),
    precompiler = require("handlebars-precompiler"),
    LessData = null;

function ensureExists(path, mask, callback) {
    if (typeof mask == 'function') {
        callback = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') callback(null);
            else callback(err);
        } else callback(null);
    });
}

function compileLESS() {
    less.render(LessData, {
        paths: [path.join(__dirname,'../../views')], 
        compress: true
    }, function(e, output) {
        if (e) {
            console.log(e);
        } else {
            fs.writeFile(path.join(__dirname,'../../public/style.css'), output.css);
        }
    });
    fs.readFile(path.join(__dirname,'../../node_modules/handlebars/dist/handlebars.runtime.js'), "utf8", function (err, data) {
        if (err) throw err;
        precompiler.do({
            "hardlebarPath": path.join(__dirname,'../../views/partials/'),
            "templates": [path.join(__dirname,'../../views/partials/')],
            "output": "public/templates.js",
            extensions: ["hbs"],
            pollInterval: 500,
            fileRegex: /modules.hbs$/,
            min: true,
            silent: false,
            amd: false,
            partial: true,
            commonjs: false
        });
        //console.log(Handlebars.precompile("", {destName: 'dest.js', srcName: path.join(__dirname,'../../views/partials/modules.hbs')}));
        fs.writeFile(path.join(__dirname,"../../public/hb.js"),data);
    });
    fs.readFile(path.join(__dirname,'../admin/thums.js'), "utf8", function (err, data) {
        if (err) throw err;
        fs.writeFile(path.join(__dirname,"../../public/thums.js"),data);
    });
}

function waitForStyle() {
    if (fs.existsSync(path.join(__dirname,'../../views/style.less'))) {
        ensureExists(path.join(__dirname,'../../public'), 0744, function(err) {
            if (err) {
                console.error(err);
            } else {
                compileLESS();
            }
        });
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

start();
module.exports = start;