/*jslint node: true, esversion: 6 */
'use strict';


var http = require('http');
var Router = require('router');
var finalhandler = require('finalhandler');
var to_rss = require('./to_rss');

var router = new Router();
router.get('/comptop', function (req, res) {
    var title = 'Computational Topology Message Board';
    var description = 'RSS feed of the computational topology message board';
    var muut = new to_rss.Muut(
        'comptop', 'dave@cs.unc.edu', title, description
    );
    to_rss.muutToRss(muut,res);
});

function requestHandler(req, res) {
    var done = finalhandler(req, res);
    router(req, res, done);
}

http.createServer(requestHandler).listen(8080);
