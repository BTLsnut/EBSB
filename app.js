var express = require('express');
var app = express();
var http = require('http').createServer(app);
var path = require('path');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var transferRouter = require('./routes/transfer');
var graph = require('./routes/graph');
var mapRouter = require('./routes/map');

var port = 8080;

// view engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/main', indexRouter);
app.use('/transfer', transferRouter);
app.use('/map', mapRouter);

app.use('/graph', graph);

var httpServer = http.listen(port, function () {
    console.log("1http server running on " + port);
});

app.get('/arrow', function(res, req) {
   res.render('test', {title: "arrow-test"});
});

module.exports = app;