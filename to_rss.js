/*
 * Author: Dave Millman <dave@cs.montana.edu>
 * Created: 07 Sep 2015
 */

var Fs = require('fs');
var Rss = require('rss');
var request = require('request');

// global constans
var SITE_URL = 'https://muut.com/comptop';
var FEED_URL = 'https://muut.com/comptop';
var SESSION_ID = 'vkx7sqKjKuJaZ4fxk5BxWqWz.50ae54e856e5d118bb16b4b3fdaf0b28b7686000';
var MAINTAINER_EMAIL = 'dave@cs.unc.edu';

// the data to get things going
var fileName = 'data/data-2016-01-19.json';
var extracted_data = {};

function makeEntryData(author, description, postTitle, url, guid, date) {
    return {
        'title': postTitle,
        'description': description,
        'url': url,
        'guid': guid,
        'author': author,
        'date': date
    };
}

function makeEntryErrorData() {
    author = 'ERROR';
    description = 'There was an error extracting data from an entry. ' +
        'Please contact ' + MAINTAINER_EMAIL + ' to report an error.';
    postTitle = 'Error extracting data for an entry';
    guid = new Date().getTime();
    date = guid;
    return makeEntryData(author, description, postTitle, guid, date);
}

function extract(entry) {
    var entryData;
    try {
        var seed = entry.seed;
        var author = seed.user.displayname;
        var description = seed.body;
        var postTitle = seed.title;
        var guid = seed.key;
        var date = seed.time;
        entryData = makeEntryData(author, description, postTitle,
                                  SITE_URL, guid, date);
    } catch (error) {
        entryData = makeEntryErrorData();
    }
    return entryData;
}

function createFeed(entries) {
    feed = new Rss({
        'title': 'Computational Topology Message Board',
        'description': 'RSS feed of the computational topology message board',
        'feed_url': FEED_URL,
        'site_url': SITE_URL
    });

    for (var idx in entries) {
        feed.item(entries[idx]);
    }

    var xml = feed.xml({indent: true});
    return xml;
}

function parseData(data) {
    var extractedEntries;
    try {
        var entries = data.result.moots.entries;
        extractedEntries = entries.map(extract);
    } catch (error) {
        extractedEntries = [makeEntryErrorData()];
    }
    xml = createFeed(extractedEntries);
    console.log(xml);
}

function processResponse(error, response, body) {
    console.log(response.statusCode);
    if (error || response.statusCode != 200) {
        consolse.log(makeEntryErrorData());
    } else {
        parseData(body);
    }
}

function makeRequest() {
    options = {
        url: 'https://api.muut.com/',
        method: 'POST',
        headers: {'Accept': 'application/json'},
        json: {
            'method': 'init',
            'params':[ {
                'version': '1.14.0',
                'path': '/comptop',
                'currentForum': 'comptop',
                'pageLocation': 'https://muut.com/comptop',
                'expand_all': false,
                'reload': false
            } ],
            'id':'#1',
            'session':{'sessionId': SESSION_ID},
            'jsonrpc':'2.1.0',
            'transport':'upgrade'
        }
    };
    request(options, processResponse);
}

makeRequest();

function readFile(error, data) {
    if (error) {
        throw error;
    } else {
        var jsonData = JSON.parse(data);
        parseData(jsonData);
    }
}

Fs.readFile(fileName, 'utf8', readFile);
