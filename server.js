/*jslint node: true, esversion: 6 */
'use strict';

var http = require('http');
var Router = require('router');
var finalhandler = require('finalhandler');
var to_rss = require('./to_rss');
var mustache  = require('mustache');
var fs = require('fs');

// setup the endpoints
var router = new Router();

// setup the the /comptop endpoint
router.get('/comptop', function (req, res) {
    var title = 'Computational Topology Message Board';
    var description = 'RSS feed of the computational topology message board';
    var muut = new to_rss.Muut(
        'comptop', 'dave@cs.unc.edu', title, description
    );
    to_rss.muutToRss(muut,res);
});

// Now that we have setup all the muuts, setup the the / endpoint
var all_muuts_template = fs.readFileSync('./all_muuts.html', 'utf8');
var paths = router.stack.map(function(obj) { return obj.route.path.substr(1); });
var routes_page = mustache.render(all_muuts_template, {muuts: paths});
router.get('/', function (req, res) {
    res.writeHead(200);
    res.end(routes_page);
});

// setup the server
var port = process.env.PORT || 8080;
function requestHandler(req, res) {
    var done = finalhandler(req, res);
    router(req, res, done);
}
http.createServer(requestHandler).listen(port);
