var express = require('express');
var app = express();
var http = require('http').createServer(app);
var path = require('path');
var indexRouter = require('./routes/index');
var transferRouter = require('./routes/transfer');
var graph = require('./routes/graph');
var port = 8080;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, '/public')));

app.use('/', indexRouter);
app.use('/transfer', transferRouter);
app.use('/graph', graph);

var httpServer = http.listen(port, function () {
    console.log("http server running on " + port);
});

class node {
    constructor(mpd_info) {
        this.pos = mpd_info["pos"];
        this.id = mpd_info["id"];
        this.src = mpd_info["location"] + mpd_info["mpdname"];
        this.link = [];
    }

    weight_link(node) {
        let link_ref = {
            distance: 0,
            x: {x_ref: "", val: 0},
            y: {y_ref: "", val: 0},
            z: {z_ref: "", val: 0}
        };

        let x_val = this.pos.x - node.pos.x;
        let y_val = this.pos.y - node.pos.y;
        let z_val = this.pos.z - node.pos.z;
        let cnt = 0;

        if (x_val < 0)
            link_ref.x.x_ref = "right";
        else if (x_val > 0)
            link_ref.x.x_ref = "left";
        else
            cnt += 1;

        if (y_val < 0)
            link_ref.y.y_ref = "top";
        else if (z_val > 0)
            link_ref.y.y_ref = "bottom";
        else
            cnt += 1;

        if (z_val < 0)
            link_ref.z.z_ref = "up";
        else if (z_val > 0)
            link_ref.z.z_ref = "down";
        else
            cnt += 1;

        link_ref.x.val = x_val >= 0 ? x_val : -1 * x_val;
        link_ref.y.val = y_val >= 0 ? y_val : -1 * y_val;
        link_ref.z.val = z_val >= 0 ? z_val : -1 * z_val;

        if (cnt) {
            link_ref.distance = this.l2_norm(x_val, y_val, z_val);
            this.link[node.id] = link_ref;
        }
    }

    l2_norm(x, y, z) {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    }

    get_link(v_list) {

    }

    print_info() {
        console.log(this.link);
    }
}

app.post('/', function(req, res, next) {
    MongoClient.connect('mongodb://117.17.184.60:27017', function (err, client) {
        if (err) throw err;
        const db = client.db("virtualspace");
        const collection = db.collection('concert');

        collection.find().toArray(function (err, docs) {
            if(err) throw err;
            console.log(docs)
        });
    });
});

module.exports = app;