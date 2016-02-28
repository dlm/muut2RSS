/*jslint node: true, esversion: 6 */
'use strict';

var Fs = require('fs');
var Rss = require('rss');
var request = require('request');

class Muut {

    constructor(board, maintainer_email, title, description) {
        this.board = board;
        this.maintainer_email = maintainer_email;
        this.title = title;
        this.description = description;
    }

    get muutURL() {
        return 'https://muut.com/';
    }

    get muutApiURL() {
        return 'https://api.muut.com/';
    }

    get boardURL() {
        return this.muutURL + this.board;
    }

    extract(entry) {
        var entryData;
        try {
            var seed = entry.seed;
            var author = seed.user.displayname;
            var description = seed.body;
            var postTitle = seed.title;
            var guid = seed.key;
            var date = seed.time;
            var path = entry.path.replace('/' + this.board, '');
            var full_path = this.muutURL + this.board + '#!' + path;
            console.log (full_path);
            entryData = this._entryData(
                author, description, postTitle, full_path, guid, date
            );
        } catch (error) {
            entryData = this.entryErrorData;
        }

        return entryData;
    }

    get entryErrorData() {
        var author = 'ERROR';
        var description = 'There was an error extracting data from an entry. ' +
            'Please contact ' + this.maintainer_email + ' to report an error.';
        var postTitle = 'Error extracting data for an entry';
        var date = new Date().getTime();
        var guid = date;
        return this._entryData(author, description, postTitle, this.muutURL, guid, date);
    }

    _entryData(author, description, postTitle, url, guid, date) {
        return {
            'title': postTitle,
            'description': description,
            'url': url,
            'guid': guid,
            'author': author,
            'date': date
        };
    }
}

function createFeed(muut, entries) {
    var feed = new Rss({
        'title': muut.title,
        'description': muut.description,
        'feed_url': muut.boardURL,
        'site_url': muut.boardURL,
    });

    for (var idx in entries) {
        feed.item(entries[idx]);
    }

    var xml = feed.xml({indent: true});
    return xml;
}

function make_muut_response_processor(muut, client_response) {
    return function(error, response, body) {
        var data = (error || response.statusCode != 200) ? {} : body;
        var extractedEntries;
        try {
            var entries = body.result.moots.entries;
            extractedEntries = entries.map(muut.extract, muut);
        } catch (error) {
            extractedEntries = [muut.entryErrorData];
        }
        var xml = createFeed(muut, extractedEntries);
        client_response.writeHead(200);
        client_response.end(xml);
    };
}

function makeRequest(muut, response) {
    var options = {
        url: muut.muutApiURL,
        method: 'POST',
        headers: {'Accept': 'application/json'},
        json: {
            'method': 'init',
            'params':[ {
                'version': '1.14.0',
                'path': '/' + muut.board,
                'currentForum': muut.board,
                'pageLocation': muut.muutURL,
                'expand_all': false,
                'reload': false
            } ],
            'id':'#1',
            'session':{'sessionId': ''},
            'jsonrpc':'2.1.0',
            'transport':'upgrade'
        }
    };
    var muut_response_processor = make_muut_response_processor(muut, response);
    request(options, muut_response_processor);
}

module.exports.muutToRss = makeRequest;
module.exports.Muut = Muut;
