var app = require('express')(), // Express framework for web applications http://expressjs.com/
    hbs = require('hbs'), // Express wrapper for Handlebars https://github.com/donpark/hbs
    fs = require('fs'),
    path = require('path'),
    server = require('http').Server(app), // Start server with Express and http
    io = require('socket.io')(server), // Socket.io real-time engine http://socket.io/
    sqlite3 = require('sqlite3').verbose(), // SQLite3 database https://github.com/mapbox/node-sqlite3
    db = new sqlite3.Database('2015_scouting_data.db'), // Create or connect to the database
    exec = require('child_process').exec,child; // Handle installing submodules

app.set('view engine', 'hbs'); // Connect handlebars to Express
hbs.registerPartials(__dirname+'/views/partials'); // Designate partials folder for handlebars

function load_app(err,data){
    if (!err){
        data = JSON.parse(data);
        console.log(data["name"]);
        child = exec("cd apps && cd "+data["name"]+" && npm install --save && cd .. && cd ..",function(error, stdout, stderr) { });
        var new_mid = require( path.join(__dirname, "/apps/",data["name"]) );
        if (data["type"].indexOf("database") >= 0) {
            new_mid.database(db);
        }
        if (data["type"].indexOf("sockets") >= 0) {
            io.on('connection',new_mid.extendSockets);
        }
        //app.use(data["path"],new_mid);
    }
    app.get('/', function (req, res) { // Index - used for client input
        res.render('index');
    });

    app.get('/api', function (req, res) { // Index - used for client input
        res.render('partials/match_input');
    });
}

require('fs').readdirSync( path.join(__dirname, "/apps/") ).forEach(function (file) {
    console.log(path.join(__dirname,'/apps/',file,'config.json'));
    fs.readFile( path.join(__dirname,'/apps/',file,'config.json') , load_app);
});





server.listen(80);