var express = require('express');
var bodyParser = require("body-parser");
var url = require('url');

const ihm = require('./my_module/ihm');

// serveur html
var server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.listen(8080);

function build(json_file) {
    console.log('json_file', json_file);
    ihm_data = require(json_file)['ihm'];
    return ihm.buildHtml(ihm_data);
}

server.get('/data/test.json', function(req, res) {
           var page = '.' + url.parse(req.url).pathname;
           res.send(build(page));
           });

server.get('/data/test2.json', function(req, res) {
           var page = '.' + url.parse(req.url).pathname;
           res.send(build(page));
           });

server.post('/data/getParams', function(req, res) {
            
            var json
            for(myKey in req.body) {
             console.log(myKey,':', req.body[myKey]);
            }
                res.send(JSON.stringify(req.body));
            });
