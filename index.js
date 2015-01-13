var app = require('express')(), // Express framework for web applications http://expressjs.com/
    hbs = require('hbs'), // Express wrapper for Handlebars https://github.com/donpark/hbs
    fs = require('fs'),
    path = require('path'),
    server = require('http').Server(app), // Start server with Express and http
    io = require('socket.io')(server); // Socket.io real-time engine http://socket.io/

app.set('view engine', 'hbs'); // Connect handlebars to Express
hbs.registerPartials(__dirname+'/views/partials'); // Designate partials folder for handlebars

fs.readFile( path.join(__dirname, 'config.json'), {encoding: 'utf-8'}, function(err,data){
    if (!err){
        data = JSON.parse(data);
        for (var x = 0; x < data["apps"].length; x++) {
            console.log(data["apps"][x]["name"]);
            var new_mid = require(data["apps"][x]["name"]);
            if (data["apps"][x]["type"].indexOf("sockets") >= 0) {
                io.on('connection',new_mid);
            }
            //app.use(data["apps"][x]["path"],new_mid);
        }
    }
    app.get('/', function (req, res) { // Index - used for client input
        res.render('index');
    });
})



server.listen(80);