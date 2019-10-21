var express = require('express');
var router = express.Router();
var fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
import '../public/js/mpd_graph'


router.post('/upload', function (req, res) {
    var form = new formidable.IncomingForm();
    console.log(form.multiples);
    form.multiples = true;
    form.maxFileSize = 1024 * 1024 * 1024;
    form.maxFieldsSize = 1024 * 1024 * 1024;
    form.hash = 'md5';
    form.parse(req, function (err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: files}));
    });

    form.on('end', function (fields, files) {
        // console.log(this.openedFiles);
        console.log(" 총 업로드 파일 갯수 == ", this.openedFiles.length);
        for (var i = 0; i < this.openedFiles.length; i++) {
            /* Temporary location of our uploaded file */
            var temp_path = this.openedFiles[i].path;
            console.log(this.openedFiles[i])
            /* The file name of the uploaded file */
            var file_name = this.openedFiles[i].name;
            var split_file = file_name.split('.mp4');
            var hash = this.openedFiles[i].hash;

            /* Location where we want to copy the uploaded file */
            var new_location = './files/';

            console.log("temp_path == ", temp_path);
            console.log("file_name == ", file_name);
            //console.log(this.openedFiles[i]);
            MongoClient.connect('mongodb://117.17.184.60:27017', function (err, client) {
                assert.equal(null, err);
                const db = client.db("multiview");
                const collection = db.collection('point');
                console.log(temp_path);

                var final_location = new_location + split_file[0] + '/';
                console.log(final_location + split_file[0] + ".mp4");
                //filename directory generate
                fs.move(temp_path, final_location + split_file[0] + ".mp4", function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        //file metadata get function
                        fs.readFile(final_location + split_file[0] + ".mp4", function (err, data) {
                            if (err)
                                throw err;
                            else {
                                // extract metadata
                                exif.metadata(data, function (err, metadata) {
                                    console.log("memory" + JSON.stringify(process.memoryUsage()))
                                    if (err)
                                        throw err;
                                    else {
                                        var metadataObj = {};
                                        for (var index in metadata) {
                                            metadataObj[index] = metadata[index]
                                        }
                                        var preparedJSON = {
                                            "filename": file_name,
                                            "location": final_location,
                                            "metadata": metadataObj
                                        };
                                        console.log(preparedJSON);
                                        collection.insertOne(preparedJSON, function (error, response) {
                                            console.log(response);
                                        })
                                    }
                                });
                            }
                        });
                        //mpd auto generator (powershell script execute)
                        var spawn = require("child_process").spawn, child;
                        child = spawn("powershell.exe", ["./files/auto.ps1", split_file[0]]);
                        child.stdout.on("data", function (data) {
                            console.log("Powershell Data: " + data);
                        });
                        child.stderr.on("data", function (data) {
                            console.log("Powershell Script: " + data);
                        });
                        child.on("exit", function () {
                            console.log("Powershell Script finished");

                        });
                        child.stdin.end();
                    }
                })
            });
        }
    });
});

module.exports = router;
