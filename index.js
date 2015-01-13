var Scouting = require('2015-Scouting');
var app = require('express')(); // Express framework for web applications http://expressjs.com/
var hbs = require('hbs'); // Express wrapper for Handlebars https://github.com/donpark/hbs

app.set('view engine', 'hbs'); // Connect handlebars to Express
hbs.registerPartials(__dirname+'/views/partials'); // Designate partials folder for handlebars

app.use(Scouting);