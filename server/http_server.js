// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var path = require('path');


var port = 60000; // set our port

var static_dir = path.join(path.dirname(__dirname), 'client\\app');
console.log(static_dir);
app.use(express.static(static_dir));

// ROUTES FOR OUR API
// =============================================================================

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
