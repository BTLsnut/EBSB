var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

// DB에 연결해서 데이터 가지고오기
router.post('/', function(req, res, next) {
    MongoClient.connect('mongodb://117.17.184.60:27017', function (err, client) {
        if (err) throw err;
        const db = client.db("multiview");
        const collection = db.collection("point");

        collection.find().toArray(function (err, docs) {
            if(err) throw err;
            res.send(docs);
        });
    });
});


module.exports = router;
