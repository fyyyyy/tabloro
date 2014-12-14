
/*!
 * nodejs-express-mongoose-demo
 * Copyright(c) 2013 Madhusudhan Srinivasa <madhums8@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies
 */

var log = console.log;

log(process.env.NODE_ENV);
var fs = require('fs');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('config');
var R = require('./public/js/ramda.js');



var app = express();
var port = process.env.PORT || 3000;
var server = require('http').createServer(app);

var EurecaServer = require('eureca.io').EurecaServer;

// create an instance of EurecaServer
var eurecaServer = new EurecaServer({
  allow: [
    'setId', 'spawnPlayer', 'kill', 'updateCursor',
    'positionTile', 'dropTile', 'dragTile',
    'dragStack', 'dropStack', 'positionStack', 'updateStackCards', 'flipStack',
    'spin',
    'receiveChat'
  ]
});
log('attach eurecaServer', eurecaServer.version);
// attach eureca.io to our http server
eurecaServer.attach(server);



// Connect to mongodb
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect(config.db, options);
};
connect();

mongoose.connection.on('error', log);
mongoose.connection.on('disconnected', connect);

// Bootstrap models
fs.readdirSync(__dirname + '/app/models').forEach(function (file) {
  if (~file.indexOf('.js')) require(__dirname + '/app/models/' + file);
});

// Bootstrap passport config
require('./config/passport')(passport, config);

// Bootstrap application settings
require('./config/express')(app, passport, eurecaServer);

// Bootstrap routes
require('./config/routes')(app, passport);

// Eureca Server config
require('./eurecaserver')(eurecaServer);

server.listen(port);
log('Express app started on port ' + port);

/**
 * Expose
 */

module.exports = app;
