var express = require('express');
var app = express();
var http = require('http').createServer(app);
var path = require('path');

var indexRouter = require('./routes/index');
var transferRouter = require('./routes/transfer');

var port = 8080;

// view engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '/public')));

app.use('/', indexRouter);
app.use('/transfer', transferRouter);

var httpServer = http.listen(port, function () {
    console.log("1http server running on " + port);
});


module.exports = app;