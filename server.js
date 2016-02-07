/*jslint node: true */
'use strict';

var http = require('http');
var Router = require('router');
var finalhandler = require('finalhandler');
var mutt = require('./to_rss');

var router = new Router();
router.get('/comptop', function (req, res) {
    mutt.toRss(res);
});

function requestHandler(req, res) {
    var done = finalhandler(req, res);
    router(req, res, done);
}

http.createServer(requestHandler).listen(8080);
