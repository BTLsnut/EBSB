var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('map', {title: 'Simple map'});
    // res.sendFile('index.html');
});

module.exports = router;
