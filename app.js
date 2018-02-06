var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var keys = require('./config/keys');
var cors = require('cors');
var helpers = require('./helpers');

var apiRoutes = require('./routes/index');


// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, { useMongoClient: true });
// set up promises for mongoose
mongoose.Promise = global.Promise;

// initiating the app
var app = express();
// allow cors to be done in http requests
app.use(cors());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  console.log('Inside middleware.  req.headers:\n', req.headers.authorization);
  helpers.verifyAuth(req.headers.authorization, function(error, result) {
    if (result) {
      // res.cookie('itemCookie', 'itemCookieValue');
      next();
    }
    else {
      console.log(error);
      res.status(401);
      res.json({
        'error': 'Not authorized',
        'code' : 401
      });
      // res.redirect('localhost:8000/login.html');
    }
  })
});

app.use('/', apiRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  res.json({
  	message: err.message,
  	error:req.app.get('env') === 'development' ? err : {}
  })
});

module.exports = app;